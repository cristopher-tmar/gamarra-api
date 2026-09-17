import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';

@Injectable()
export class TiendasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTiendaDto: CreateTiendaDto) {
    const tiendaExistente = await this.prisma.tienda.findUnique({
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
      data: createTiendaDto,
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

  async update(
    id: number,
    updateTiendaDto: UpdateTiendaDto,
  ) {
    await this.findOne(id);

    return this.prisma.tienda.update({
      where: {
        id,
      },
      data: updateTiendaDto,
    });
  }

  async remove(id: number) {
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