import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

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
          ? (createProductoDto.atributos as Prisma.InputJsonValue)
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
  ) {
    await this.findOne(id);

    if (updateProductoDto.tiendaId) {
      const tienda = await this.prisma.tienda.findUnique({
        where: {
          id: updateProductoDto.tiendaId,
        },
      });

      if (!tienda) {
        throw new NotFoundException(
          `No existe una tienda con el ID ${updateProductoDto.tiendaId}`,
        );
      }
    }

    if (updateProductoDto.codigo) {
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

    const { atributos, ...datosProducto } =
      updateProductoDto;

    return this.prisma.producto.update({
      where: {
        id,
      },
      data: {
        ...datosProducto,
        atributos: atributos
          ? (atributos as Prisma.InputJsonValue)
          : undefined,
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.producto.delete({
      where: {
        id,
      },
    });

    return {
      mensaje: 'Producto eliminado correctamente',
    };
  }
}