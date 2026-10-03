import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ImageStorage } from '../producto-imagenes/interfaces/image-storage.interface';

import type { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { RolUsuario } from '../generated/prisma/enums';

@Injectable()
export class ProductosService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorage,
  ) { }

  private readonly logger = new Logger(
    ProductosService.name,
  );

  private validarPermisoSobreTienda(
    usuario: JwtPayload,
    propietarioId: number,
    mensaje: string,
  ): void {
    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    const esPropietario =
      propietarioId === usuario.sub;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(mensaje);
    }
  }

  async create(
    createProductoDto: CreateProductoDto,
    usuario: JwtPayload,
  ) {
    const tienda =
      await this.prisma.tienda.findUnique({
        where: {
          id: createProductoDto.tiendaId,
        },
      });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${createProductoDto.tiendaId}`,
      );
    }

    this.validarPermisoSobreTienda(
      usuario,
      tienda.usuarioId,
      'No tiene permisos para registrar productos en esta tienda',
    );

    const productoExistente =
      await this.prisma.producto.findUnique({
        where: {
          codigo: createProductoDto.codigo,
        },
      });

    if (productoExistente) {
      throw new ConflictException(
        `Ya existe un producto con el código ${createProductoDto.codigo}`,
      );
    }

    return this.prisma.producto.create({
      data: {
        tiendaId: createProductoDto.tiendaId,
        codigo: createProductoDto.codigo,
        nombre: createProductoDto.nombre,
        categoria: createProductoDto.categoria,
        descripcion: createProductoDto.descripcion,
        precio: createProductoDto.precio,
        stock: createProductoDto.stock,
        atributos: createProductoDto.atributos
          ? (
            createProductoDto.atributos as
            Prisma.InputJsonValue
          )
          : undefined,
        estado: createProductoDto.estado,
      },
      include: {
        tienda: true,
        imagenes: {
          orderBy: [
            {
              principal: 'desc',
            },
            {
              orden: 'asc',
            },
          ],
        },
      },
    });
  }

  findAll() {
    return this.prisma.producto.findMany({
      include: {
        tienda: true,
        imagenes: {
          where: {
            estado: true,
          },
          orderBy: [
            {
              principal: 'desc',
            },
            {
              orden: 'asc',
            },
          ],
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: {
        id,
      },
      include: {
        tienda: true,
        imagenes: {
          orderBy: [
            {
              principal: 'desc',
            },
            {
              orden: 'asc',
            },
          ],
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id}`,
      );
    }

    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    usuario: JwtPayload,
  ) {
    const productoActual =
      await this.prisma.producto.findUnique({
        where: {
          id,
        },
        include: {
          tienda: true,
        },
      });

    if (!productoActual) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id}`,
      );
    }

    // El comerciante solo puede modificar productos
    // registrados en una de sus propias tiendas.
    this.validarPermisoSobreTienda(
      usuario,
      productoActual.tienda.usuarioId,
      'No tiene permisos para modificar este producto',
    );

    // Si intenta cambiar el producto de tienda,
    // validamos que la nueva tienda exista y le pertenezca.
    if (
      updateProductoDto.tiendaId !== undefined &&
      updateProductoDto.tiendaId !==
      productoActual.tiendaId
    ) {
      const nuevaTienda =
        await this.prisma.tienda.findUnique({
          where: {
            id: updateProductoDto.tiendaId,
          },
        });

      if (!nuevaTienda) {
        throw new NotFoundException(
          `No existe una tienda con el ID ${updateProductoDto.tiendaId}`,
        );
      }

      this.validarPermisoSobreTienda(
        usuario,
        nuevaTienda.usuarioId,
        'No tiene permisos para trasladar el producto a esta tienda',
      );
    }

    // Si cambia el código, verificamos que no esté
    // siendo utilizado por otro producto.
    if (
      updateProductoDto.codigo !== undefined &&
      updateProductoDto.codigo !==
      productoActual.codigo
    ) {
      const productoConCodigo =
        await this.prisma.producto.findUnique({
          where: {
            codigo: updateProductoDto.codigo,
          },
        });

      if (
        productoConCodigo &&
        productoConCodigo.id !== id
      ) {
        throw new ConflictException(
          `Ya existe otro producto con el código ${updateProductoDto.codigo}`,
        );
      }
    }

    const {
      atributos,
      ...datosProducto
    } = updateProductoDto;

    return this.prisma.producto.update({
      where: {
        id,
      },
      data: {
        ...datosProducto,

        /*
         * Solo se modifica atributos cuando el DTO
         * realmente contiene esa propiedad.
         *
         * Si no fue enviada, Prisma conserva el valor actual.
         */
        atributos:
          atributos !== undefined
            ? (
              atributos as
              Prisma.InputJsonValue
            )
            : undefined,
      },
      include: {
        tienda: true,
        imagenes: {
          where: {
            estado: true,
          },
          orderBy: [
            {
              principal: 'desc',
            },
            {
              orden: 'asc',
            },
          ],
        },
      },
    });
  }

  async remove(
    id: number,
    usuario: JwtPayload,
  ) {
    const producto =
      await this.prisma.producto.findUnique({
        where: {
          id,
        },
        include: {
          tienda: true,
          imagenes: {
            select: {
              id: true,
              nombreAlmacenado: true,
            },
          },
        },
      });

    if (!producto) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id}`,
      );
    }

    this.validarPermisoSobreTienda(
      usuario,
      producto.tienda.usuarioId,
      'No tiene permisos para eliminar este producto',
    );

    const archivosSupabase = producto.imagenes
      .map((imagen) => imagen.nombreAlmacenado)
      .filter(
        (
          nombreAlmacenado,
        ): nombreAlmacenado is string =>
          nombreAlmacenado !== null,
      );

    /*
     * Al eliminar el producto, PostgreSQL elimina también
     * ProductoImagen y sus embeddings mediante cascade.
     */
    await this.prisma.producto.delete({
      where: {
        id,
      },
    });

    const archivosNoEliminados: string[] = [];

    /*
     * Después se eliminan de Supabase los archivos físicos.
     * Un error de almacenamiento no impide que continúe
     * la eliminación de los demás archivos.
     */
    for (const nombreAlmacenado of archivosSupabase) {
      try {
        await this.imageStorage.eliminar(
          nombreAlmacenado,
        );
      } catch (error: unknown) {
        archivosNoEliminados.push(
          nombreAlmacenado,
        );

        this.logger.error(
          `No se pudo eliminar de Supabase el archivo ${nombreAlmacenado}`,
          error instanceof Error
            ? error.stack
            : String(error),
        );
      }
    }

    const imagenesEliminadas =
      archivosSupabase.length -
      archivosNoEliminados.length;

    const almacenamientoLimpio =
      archivosNoEliminados.length === 0;

    return {
      mensaje: almacenamientoLimpio
        ? 'Producto eliminado correctamente'
        : 'Producto eliminado, pero algunos archivos no pudieron eliminarse del almacenamiento',
      productoId: id,
      imagenesEliminadas,
      archivosNoEliminados,
      almacenamientoLimpio,
    };
  }

}