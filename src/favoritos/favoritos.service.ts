import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

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
        orderBy: {
          fechaCreacion: 'desc',
        },
        include: {
          producto: {
            include: {
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
                },
                orderBy: [
                  {
                    principal: 'desc',
                  },
                  {
                    orden: 'asc',
                  },
                ],
                select: {
                  id: true,
                  url: true,
                  principal: true,
                  orden: true,
                },
              },
            },
          },
        },
      });

    return {
      mensaje:
        'Favoritos obtenidos correctamente',
      total: favoritos.length,
      favoritos: favoritos.map(
        (favorito) => ({
          id: favorito.id,
          fechaCreacion:
            favorito.fechaCreacion,
          producto: favorito.producto,
        }),
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