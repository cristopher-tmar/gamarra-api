import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { RolUsuario } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { VisionService } from '../vision/vision.service';
import { EstadoProcesamientoImagen } from '../generated/prisma/enums';
import type { JwtPayload } from '../auth/guards/jwt-auth.guard';

export interface ImagenParaProcesar {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

@Injectable()
export class ProductoImagenesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly visionService: VisionService,
    ) { }

    async procesarEmbedding(
        imagenId: number,
        archivo: ImagenParaProcesar,
        correlationId: string,
        usuario: JwtPayload,
    ) {
        const imagenRegistrada =
            await this.prisma.productoImagen.findUnique({
                where: {
                    id: imagenId,
                },
                include: {
                    producto: {
                        include: {
                            tienda: true,
                        },
                    },
                },
            });

        if (!imagenRegistrada) {
            throw new NotFoundException(
                `No existe una imagen de producto con el ID ${imagenId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            imagenRegistrada.producto.tienda.usuarioId ===
            usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para procesar esta imagen',
            );
        }

        await this.prisma.productoImagen.update({
            where: {
                id: imagenId,
            },
            data: {
                estadoProcesamiento:
                    EstadoProcesamientoImagen.PROCESANDO,
                mensajeError: null,
            },
        });

        try {
            const resultadoVision =
                await this.visionService.generarEmbedding(
                    archivo,
                    correlationId,
                );

            if (resultadoVision.dimension !== 512) {
                throw new Error(
                    `El servicio de visión devolvió una dimensión inválida: ${resultadoVision.dimension}`,
                );
            }

            const vectorTexto =
                `[${resultadoVision.embedding.join(',')}]`;

            await this.prisma.$transaction(
                async (transaction) => {
                    await transaction.$executeRaw`
        UPDATE "producto_imagen"
        SET "embedding" = ${vectorTexto}::vector
        WHERE "id" = ${imagenId}
      `;

                    await transaction.productoImagen.update({
                        where: {
                            id: imagenId,
                        },
                        data: {
                            nombreOriginal:
                                resultadoVision.archivo.nombreOriginal,
                            mimeType:
                                resultadoVision.archivo.mimeType,
                            tamanioBytes:
                                resultadoVision.archivo.tamanioBytes,
                            ancho:
                                resultadoVision.archivo.ancho,
                            alto:
                                resultadoVision.archivo.alto,
                            hashArchivo:
                                resultadoVision.archivo.hashSha256,
                            modeloEmbedding:
                                resultadoVision.modelo,
                            fechaProcesamiento: new Date(),
                            estadoProcesamiento:
                                EstadoProcesamientoImagen.PROCESADA,
                            mensajeError: null,
                        },
                    });
                },
            );

            return {
                mensaje:
                    'La imagen fue procesada y su embedding fue almacenado correctamente',
                imagenId: imagenRegistrada.id,
                productoId: imagenRegistrada.productoId,
                modelo: resultadoVision.modelo,
                dimension: resultadoVision.dimension,
                hashSha256:
                    resultadoVision.archivo.hashSha256,
                tiempoProcesamientoMs:
                    resultadoVision.tiempoProcesamientoMs,
                estadoProcesamiento:
                    EstadoProcesamientoImagen.PROCESADA,
            };
        } catch (error: unknown) {
            const mensajeError =
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error desconocido al procesar la imagen';

            await this.prisma.productoImagen.update({
                where: {
                    id: imagenId,
                },
                data: {
                    estadoProcesamiento:
                        EstadoProcesamientoImagen.ERROR,
                    mensajeError: mensajeError.substring(0, 500),
                    fechaProcesamiento: new Date(),
                },
            });

            throw error;
        }

    }
}