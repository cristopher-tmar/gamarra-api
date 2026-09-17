import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductoDto: CreateProductoDto) {
    const tienda = await this.prisma.tienda.findUnique({
      where: {
        id: createProductoDto.tiendaId,
      },
    });

    if (!tienda) {
      throw new NotFoundException(
        `No existe una tienda con el ID ${createProductoDto.tiendaId}`,
      );
    }

    return this.prisma.producto.create({
      data: createProductoDto,
    });
  }

  findAll() {
    return this.prisma.producto.findMany({
      include: {
        tienda: true,
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
  ) {
    await this.findOne(id);

    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.producto.delete({
      where: { id },
    });

    return {
      mensaje: 'Producto eliminado correctamente',
    };
  }
}