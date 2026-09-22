import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { RolUsuario } from '../generated/prisma/enums';

@Injectable()
export class TiendasService {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    createTiendaDto: CreateTiendaDto,
    usuarioId: number,
  ) {
    const tiendaExistente =
      await this.prisma.tienda.findUnique({
        where: {
          codigo: createTiendaDto.codigo,
        },
      });

    if (tiendaExistente) {
      throw new ConflictException(
        `Ya existe una tienda con el código ${createTiendaDto.codigo}`,
      );
    }

    return this.prisma.tienda.create({
      data: {
        ...createTiendaDto,
        usuarioId,
      },
    });
  }


  findAll() {
    return this.prisma.tienda.findMany({
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  findMyStores(usuario: {
    sub: number;
    rol: string;
  }) {
    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    return this.prisma.tienda.findMany({
      where: esAdministrador
        ? undefined
        : {
          usuarioId: usuario.sub,
        },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const tienda = await this.prisma.tienda.findUnique({
      where: {
        id,
      },
    });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${id}`,
      );
    }

    return tienda;
  }

  async findOneAuthorized(
    id: number,
    usuario: {
      sub: number;
      rol: string;
    },
  ) {
    const tienda = await this.findOne(id);

    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    const esPropietario =
      tienda.usuarioId === usuario.sub;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(
        'No tiene permisos para consultar esta tienda',
      );
    }

    return tienda;
  }


  async findProductos(id: number) {
    const tienda = await this.prisma.tienda.findUnique({
      where: {
        id,
      },
      include: {
        productos: {
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${id}`,
      );
    }

    return tienda;
  }

  async findProductosAuthorized(
    id: number,
    usuario: {
      sub: number;
      rol: string;
    },
  ) {
    const tienda = await this.prisma.tienda.findUnique({
      where: {
        id,
      },
      include: {
        productos: {
          include: {
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
            fechaCreacion: 'desc',
          },
        },
      },
    });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${id}`,
      );
    }

    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    const esPropietario =
      tienda.usuarioId === usuario.sub;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(
        'No tiene permisos para consultar los productos de esta tienda',
      );
    }

    return tienda;
  }

  async update(
    id: number,
    updateTiendaDto: UpdateTiendaDto,
    usuario: {
      sub: number;
      rol: string;
    },
  ) {
    const tienda = await this.findOne(id);

    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    const esPropietario =
      tienda.usuarioId === usuario.sub;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(
        'No tiene permisos para modificar esta tienda',
      );
    }

    return this.prisma.tienda.update({
      where: {
        id,
      },
      data: updateTiendaDto,
    });
  }

  async remove(
    id: number,
    usuario: {
      sub: number;
      rol: string;
    },
  ) {
    const tienda = await this.prisma.tienda.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${id}`,
      );
    }

    const esAdministrador =
      usuario.rol === RolUsuario.ADMINISTRADOR;

    const esPropietario =
      tienda.usuarioId === usuario.sub;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(
        'No tiene permisos para eliminar esta tienda',
      );
    }

    if (tienda._count.productos > 0) {
      throw new ConflictException(
        'No se puede eliminar la tienda porque tiene productos asociados',
      );
    }

    await this.prisma.tienda.delete({
      where: {
        id,
      },
    });

    return {
      mensaje: 'Tienda eliminada correctamente',
    };
  }
}