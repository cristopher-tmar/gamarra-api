import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { RolUsuario } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { VisionService } from '../vision/vision.service';
import { EstadoProcesamientoImagen } from '../generated/prisma/enums';
import type { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { ImageStorage } from './interfaces/image-storage.interface';
import { ReordenarImagenesDto } from './dto/reordenar-imagenes.dto';
import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { productoImagenSelect } from './selects/producto-imagen.select';
export interface ImagenParaProcesar {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

interface ProductoSimilar {
    productoId: number;
    codigo: string;
    nombre: string;
    categoria: string;
    descripcion: string | null;
    precio: unknown;
    stock: number;
    imagenId: number;
    imagenUrl: string;
    distancia: number;
    similitud: number;
}

@Injectable()
export class ProductoImagenesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly visionService: VisionService,
        private readonly imageStorage: ImageStorage,
        private readonly configService: ConfigService,
    ) { }

    private readonly logger = new Logger(
        ProductoImagenesService.name,
    );

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

    async registrarYProcesarImagen(
        productoId: number,
        archivo: ImagenParaProcesar,
        correlationId: string,
        usuario: JwtPayload,
    ) {
        const producto =
            await this.prisma.producto.findUnique({
                where: {
                    id: productoId,
                },
                include: {
                    tienda: true,
                    _count: {
                        select: {
                            imagenes: true,
                        },
                    },
                },
            });

        if (!producto) {
            throw new NotFoundException(
                `No existe un producto con el ID ${productoId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            producto.tienda.usuarioId === usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para registrar imágenes en este producto',
            );
        }

        // Se calcula el hash antes de subir la imagen a Supabase
        const hashArchivo = createHash('sha256')
            .update(archivo.buffer)
            .digest('hex');

        // Se comprueba si el mismo archivo ya está registrado
        const imagenDuplicada =
            await this.prisma.productoImagen.findFirst({
                where: {
                    productoId,
                    hashArchivo,
                },
            });

        if (imagenDuplicada) {
            throw new ConflictException(
                'Esta imagen ya se encuentra registrada en el producto',
            );
        }

        // Solo se sube a Supabase si no está duplicada
        const imagenAlmacenada =
            await this.imageStorage.guardar(
                productoId,
                archivo,
            );

        let imagenRegistrada;

        try {
            imagenRegistrada =
                await this.prisma.productoImagen.create({
                    data: {
                        productoId,
                        url: imagenAlmacenada.url,
                        nombreAlmacenado:
                            imagenAlmacenada.nombreAlmacenado,
                        nombreOriginal: archivo.originalname,
                        mimeType: archivo.mimetype,
                        tamanioBytes: archivo.buffer.length,
                        hashArchivo,
                        principal:
                            producto._count.imagenes === 0,
                        orden:
                            producto._count.imagenes + 1,
                        estado: true,
                        estadoProcesamiento:
                            EstadoProcesamientoImagen.PENDIENTE,
                    },
                });
        } catch (error: unknown) {
            await this.imageStorage.eliminar(
                imagenAlmacenada.nombreAlmacenado,
            );

            throw error;
        }

        return this.procesarEmbedding(
            imagenRegistrada.id,
            archivo,
            correlationId,
            usuario,
        );
    }

    async listarImagenesPorProducto(
        productoId: number,
        usuario: JwtPayload,
    ) {
        const producto =
            await this.prisma.producto.findUnique({
                where: {
                    id: productoId,
                },
                include: {
                    tienda: true,
                },
            });

        if (!producto) {
            throw new NotFoundException(
                `No existe un producto con el ID ${productoId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            producto.tienda.usuarioId === usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para consultar las imágenes de este producto',
            );
        }

        const imagenes =
            await this.prisma.productoImagen.findMany({
                where: {
                    productoId,
                    estado: true,
                },
                select: productoImagenSelect,
                orderBy: [
                    {
                        principal: 'desc',
                    },
                    {
                        orden: 'asc',
                    },
                ],
            });

        return {
            productoId,
            total: imagenes.length,
            imagenes,
        };
    }

    async establecerComoPrincipal(
        imagenId: number,
        usuario: JwtPayload,
    ) {
        const imagen =
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

        if (!imagen) {
            throw new NotFoundException(
                `No existe una imagen de producto con el ID ${imagenId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            imagen.producto.tienda.usuarioId ===
            usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para modificar esta imagen',
            );
        }

        const imagenesProducto =
            await this.prisma.productoImagen.findMany({
                where: {
                    productoId: imagen.productoId,
                },
                orderBy: [
                    {
                        orden: 'asc',
                    },
                    {
                        id: 'asc',
                    },
                ],
            });

        const imagenesReordenadas = [
            imagen,
            ...imagenesProducto.filter(
                (item) => item.id !== imagenId,
            ),
        ];

        await this.prisma.$transaction(
            imagenesReordenadas.map(
                (item, indice) =>
                    this.prisma.productoImagen.update({
                        where: {
                            id: item.id,
                        },
                        data: {
                            orden: indice + 1,
                            principal: item.id === imagenId,
                        },
                    }),
            ),
        );

        return {
            mensaje:
                'La imagen fue establecida como principal correctamente',
            imagenId,
            productoId: imagen.productoId,
            principal: true,
            orden: 1,
        };
    }

    async eliminarImagen(
        imagenId: number,
        usuario: JwtPayload,
    ) {
        const imagen =
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

        if (!imagen) {
            throw new NotFoundException(
                `No existe una imagen de producto con el ID ${imagenId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            imagen.producto.tienda.usuarioId ===
            usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para eliminar esta imagen',
            );
        }

        const imagenesRestantes =
            await this.prisma.productoImagen.findMany({
                where: {
                    productoId: imagen.productoId,
                    id: {
                        not: imagenId,
                    },
                },
                orderBy: [
                    {
                        principal: 'desc',
                    },
                    {
                        orden: 'asc',
                    },
                    {
                        id: 'asc',
                    },
                ],
            });

        const nuevaPrincipalId =
            imagen.principal
                ? imagenesRestantes[0]?.id
                : imagenesRestantes.find(
                    (item) => item.principal,
                )?.id ?? imagenesRestantes[0]?.id;

        await this.prisma.$transaction(
            async (transaction) => {
                await transaction.productoImagen.delete({
                    where: {
                        id: imagenId,
                    },
                });

                for (
                    let indice = 0;
                    indice < imagenesRestantes.length;
                    indice++
                ) {
                    const imagenRestante =
                        imagenesRestantes[indice];

                    await transaction.productoImagen.update({
                        where: {
                            id: imagenRestante.id,
                        },
                        data: {
                            orden: indice + 1,
                            principal:
                                imagenRestante.id === nuevaPrincipalId,
                        },
                    });
                }
            },
        );

        let archivoEliminado = true;

        if (imagen.nombreAlmacenado) {
            try {
                await this.imageStorage.eliminar(
                    imagen.nombreAlmacenado,
                );
            } catch (error: unknown) {
                archivoEliminado = false;

                this.logger.error(
                    `No se pudo eliminar de Supabase el archivo ${imagen.nombreAlmacenado}`,
                    error instanceof Error
                        ? error.stack
                        : String(error),
                );
            }
        }

        return {
            mensaje: 'Imagen eliminada correctamente',
            imagenId,
            productoId: imagen.productoId,
            nuevaImagenPrincipalId:
                nuevaPrincipalId ?? null,
            archivoEliminado,
        };
    }

    async reordenarImagenes(
        productoId: number,
        reordenarImagenesDto: ReordenarImagenesDto,
        usuario: JwtPayload,
    ) {
        const producto =
            await this.prisma.producto.findUnique({
                where: {
                    id: productoId,
                },
                include: {
                    tienda: true,
                    imagenes: true,
                },
            });

        if (!producto) {
            throw new NotFoundException(
                `No existe un producto con el ID ${productoId}`,
            );
        }

        const esAdministrador =
            usuario.rol === RolUsuario.ADMINISTRADOR;

        const esPropietario =
            producto.tienda.usuarioId === usuario.sub;

        if (!esAdministrador && !esPropietario) {
            throw new ForbiddenException(
                'No tiene permisos para reordenar las imágenes de este producto',
            );
        }

        const imagenesSolicitadas =
            reordenarImagenesDto.imagenes;

        const idsSolicitados =
            imagenesSolicitadas.map(
                (imagen) => imagen.imagenId,
            );

        const ordenesSolicitados =
            imagenesSolicitadas.map(
                (imagen) => imagen.orden,
            );

        const idsUnicos = new Set(idsSolicitados);
        const ordenesUnicos =
            new Set(ordenesSolicitados);

        if (idsUnicos.size !== idsSolicitados.length) {
            throw new BadRequestException(
                'La lista contiene identificadores de imágenes repetidos',
            );
        }

        if (
            ordenesUnicos.size !==
            ordenesSolicitados.length
        ) {
            throw new BadRequestException(
                'La lista contiene valores de orden repetidos',
            );
        }

        if (
            imagenesSolicitadas.length !==
            producto.imagenes.length
        ) {
            throw new BadRequestException(
                'Debe proporcionar todas las imágenes del producto',
            );
        }

        const idsProducto = new Set(
            producto.imagenes.map(
                (imagen) => imagen.id,
            ),
        );

        const contieneImagenAjena =
            idsSolicitados.some(
                (imagenId) =>
                    !idsProducto.has(imagenId),
            );

        if (contieneImagenAjena) {
            throw new BadRequestException(
                'Una o más imágenes no pertenecen al producto indicado',
            );
        }

        const ordenesEsperados =
            Array.from(
                {
                    length: imagenesSolicitadas.length,
                },
                (_, indice) => indice + 1,
            );

        const ordenesOrdenados = [
            ...ordenesSolicitados,
        ].sort((a, b) => a - b);

        const ordenConsecutivo =
            ordenesOrdenados.every(
                (orden, indice) =>
                    orden === ordenesEsperados[indice],
            );

        if (!ordenConsecutivo) {
            throw new BadRequestException(
                `Los órdenes deben ser consecutivos desde 1 hasta ${imagenesSolicitadas.length}`,
            );
        }

        const imagenPrincipalId =
            imagenesSolicitadas.find(
                (imagen) => imagen.orden === 1,
            )?.imagenId;

        await this.prisma.$transaction(
            imagenesSolicitadas.map(
                (imagen) =>
                    this.prisma.productoImagen.update({
                        where: {
                            id: imagen.imagenId,
                        },
                        data: {
                            orden: imagen.orden,
                            principal:
                                imagen.imagenId ===
                                imagenPrincipalId,
                        },
                    }),
            ),
        );

        const imagenesActualizadas =
            await this.prisma.productoImagen.findMany({
                where: {
                    productoId,
                },
                select: productoImagenSelect,
                orderBy: {
                    orden: 'asc',
                },
            });

        return {
            mensaje:
                'Las imágenes fueron reordenadas correctamente',
            productoId,
            imagenPrincipalId,
            imagenes: imagenesActualizadas,
        };
    }

    async buscarProductosPorImagen(
        archivo: ImagenParaProcesar,
        correlationId: string,
    ) {
        const resultadoVision =
            await this.visionService.generarEmbedding(
                archivo,
                correlationId,
            );

        if (resultadoVision.dimension !== 512) {
            throw new BadRequestException(
                `El servicio de visión devolvió una dimensión inválida: ${resultadoVision.dimension}`,
            );
        }

        /*
         * Similitud coseno mínima aceptada.
         *
         * 0.80 equivale a 80 % de similitud matemática.
         * No representa una probabilidad ni exactitud del modelo.
         */
        const similitudMinima =
            this.configService.getOrThrow<number>(
                'VISUAL_SEARCH_MIN_SIMILARITY',
            );

        const vectorTexto =
            `[${resultadoVision.embedding.join(',')}]`;

        const productosSimilares =
            await this.prisma.$queryRaw<
                ProductoSimilar[]
            >`
      WITH coincidencias AS (
        SELECT
          p."id" AS "productoId",
          p."codigo",
          p."nombre",
          p."categoria",
          p."descripcion",
          p."precio",
          p."stock",
          pi."id" AS "imagenId",
          pi."url" AS "imagenUrl",
          pi."embedding" <=> ${vectorTexto}::vector
            AS "distancia",
          ROW_NUMBER() OVER (
            PARTITION BY p."id"
            ORDER BY
              pi."embedding" <=> ${vectorTexto}::vector
          ) AS "posicion"
        FROM "producto_imagen" pi
        INNER JOIN "producto" p
          ON p."id" = pi."producto_id"
        WHERE pi."estado" = true
          AND p."estado" = true
          AND pi."estado_procesamiento" = 'PROCESADA'
          AND pi."embedding" IS NOT NULL
      )
      SELECT
        "productoId",
        "codigo",
        "nombre",
        "categoria",
        "descripcion",
        "precio",
        "stock",
        "imagenId",
        "imagenUrl",
        "distancia",
        1 - "distancia" AS "similitud"
      FROM coincidencias
      WHERE "posicion" = 1
        AND 1 - "distancia" >= ${similitudMinima}
      ORDER BY "distancia" ASC
    `;

        const productos = productosSimilares.map(
            (producto) => {
                const distancia =
                    Number(producto.distancia);

                const similitud =
                    Number(producto.similitud);

                return {
                    ...producto,
                    distancia,
                    similitud,
                    similitudPorcentaje:
                        Math.round(similitud * 10000) / 100,
                };
            },
        );

        return {
            mensaje:
                productos.length > 0
                    ? 'Búsqueda visual realizada correctamente'
                    : 'No se encontraron productos con el nivel mínimo de similitud',
            consulta: {
                nombreOriginal: archivo.originalname,
                mimeType: archivo.mimetype,
                modelo: resultadoVision.modelo,
                dimension: resultadoVision.dimension,
                tiempoProcesamientoMs:
                    resultadoVision.tiempoProcesamientoMs,
            },
            criterioBusqueda: {
                similitudMinima,
                similitudMinimaPorcentaje:
                    similitudMinima * 100,
            },
            total: productos.length,
            productos,
        };
    }

}