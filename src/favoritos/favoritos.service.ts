import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EstadoProcesamientoImagen,
} from '../generated/prisma/enums';
import {
  catalogoImagenSelect,
} from '../catalogo/selects/catalogo-imagen.select';
import {
  PrismaService,
} from '../prisma/prisma.service';

@Injectable()
export class FavoritosService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async listar(
    usuarioId: number,
  ) {
    const favoritos =
      await this.prisma.favorito.findMany({
        where: {
          usuarioId,
          producto: {
            estado: true,
            tienda: {
              estado: true,
            },
          },
        },
        select: {
          id: true,
          fechaCreacion: true,
          producto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
              descripcion: true,
              precio: true,
              stock: true,
              atributos: true,
              fechaCreacion: true,
              tienda: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  galeria: true,
                  piso: true,
                  numeroLocal: true,
                },
              },
              imagenes: {
                where: {
                  estado: true,
                  estadoProcesamiento:
                    EstadoProcesamientoImagen.PROCESADA,
                },
                select:
                  catalogoImagenSelect,
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
                take: 1,
              },
            },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

    return {
      mensaje:
        'Favoritos obtenidos correctamente',
      total: favoritos.length,
      favoritos: favoritos.map(
        ({
          id,
          fechaCreacion,
          producto,
        }) => {
          const {
            imagenes,
            precio,
            ...productoBase
          } = producto;

          return {
            id,
            fechaCreacion,
            producto: {
              ...productoBase,
              precio: Number(precio),
              disponible:
                producto.stock > 0,
              imagenPrincipal:
                imagenes[0] ?? null,
            },
          };
        },
      ),
    };
  }

  async agregar(
    usuarioId: number,
    productoId: number,
  ) {
    const producto =
      await this.prisma.producto.findFirst({
        where: {
          id: productoId,
          estado: true,
          tienda: {
            estado: true,
          },
        },
        select: {
          id: true,
          nombre: true,
        },
      });

    if (!producto) {
      throw new NotFoundException(
        'El producto no existe o no está disponible',
      );
    }

    const favorito =
      await this.prisma.favorito.upsert({
        where: {
          usuarioId_productoId: {
            usuarioId,
            productoId,
          },
        },
        update: {},
        create: {
          usuarioId,
          productoId,
        },
        select: {
          id: true,
          usuarioId: true,
          productoId: true,
          fechaCreacion: true,
        },
      });

    return {
      mensaje:
        'Producto agregado a favoritos',
      favorito,
    };
  }

  async eliminar(
    usuarioId: number,
    productoId: number,
  ) {
    const favorito =
      await this.prisma.favorito.findUnique({
        where: {
          usuarioId_productoId: {
            usuarioId,
            productoId,
          },
        },
        select: {
          id: true,
        },
      });

    if (!favorito) {
      throw new NotFoundException(
        'El producto no se encuentra en favoritos',
      );
    }

    await this.prisma.favorito.delete({
      where: {
        usuarioId_productoId: {
          usuarioId,
          productoId,
        },
      },
    });

    return {
      mensaje:
        'Producto eliminado de favoritos',
      productoId,
    };
  }
}
