import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  EstadoProcesamientoImagen,
} from '../generated/prisma/enums';
import {
  type ImagenParaProcesar,
  ProductoImagenesService,
} from '../producto-imagenes/producto-imagenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultarCatalogoDto } from './dto/consultar-catalogo.dto';
import { catalogoImagenSelect } from './selects/catalogo-imagen.select';

@Injectable()
export class CatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productoImagenesService:
      ProductoImagenesService,
  ) {}

  async listar(
    consultarCatalogoDto: ConsultarCatalogoDto,
  ) {
    const pagina =
      consultarCatalogoDto.pagina ?? 1;

    const limite =
      consultarCatalogoDto.limite ?? 12;

    const buscar =
      consultarCatalogoDto.buscar?.trim();

    const categoria =
      consultarCatalogoDto.categoria?.trim();

    const tiendaId =
      consultarCatalogoDto.tiendaId;

    const where: Prisma.ProductoWhereInput = {
      estado: true,
      tienda: {
        estado: true,
      },
    };

    if (tiendaId !== undefined) {
      where.tiendaId = tiendaId;
    }

    if (categoria) {
      where.categoria = {
        equals: categoria,
        mode: 'insensitive',
      };
    }

    if (buscar) {
      where.OR = [
        {
          codigo: {
            contains: buscar,
            mode: 'insensitive',
          },
        },
        {
          nombre: {
            contains: buscar,
            mode: 'insensitive',
          },
        },
        {
          categoria: {
            contains: buscar,
            mode: 'insensitive',
          },
        },
        {
          descripcion: {
            contains: buscar,
            mode: 'insensitive',
          },
        },
      ];
    }

    const registrosAOmitir =
      (pagina - 1) * limite;

    const [
      total,
      productos,
    ] = await this.prisma.$transaction([
      this.prisma.producto.count({
        where,
      }),

      this.prisma.producto.findMany({
        where,
        skip: registrosAOmitir,
        take: limite,
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
            select: catalogoImagenSelect,
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
        orderBy: {
          fechaCreacion: 'desc',
        },
      }),
    ]);

    const totalPaginas =
      total === 0
        ? 0
        : Math.ceil(total / limite);

    return {
      pagina,
      limite,
      total,
      totalPaginas,
      tienePaginaAnterior:
        pagina > 1,
      tienePaginaSiguiente:
        pagina < totalPaginas,
      filtros: {
        buscar: buscar ?? null,
        categoria: categoria ?? null,
        tiendaId: tiendaId ?? null,
      },
      productos: productos.map(
        ({
          imagenes,
          precio,
          ...producto
        }) => ({
          ...producto,
          precio: Number(precio),
          disponible: producto.stock > 0,
          imagenPrincipal:
            imagenes[0] ?? null,
        }),
      ),
    };
  }

  async obtenerDetalle(
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
          codigo: true,
          nombre: true,
          categoria: true,
          descripcion: true,
          precio: true,
          stock: true,
          atributos: true,
          fechaCreacion: true,
          fechaModificacion: true,
          tienda: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              descripcion: true,
              galeria: true,
              piso: true,
              numeroLocal: true,
              telefono: true,
            },
          },
          imagenes: {
            where: {
              estado: true,
              estadoProcesamiento:
                EstadoProcesamientoImagen.PROCESADA,
            },
            select: catalogoImagenSelect,
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
          },
        },
      });

    if (!producto) {
      throw new NotFoundException(
        `No existe un producto disponible con el ID ${productoId}`,
      );
    }

    const imagenPrincipal =
      producto.imagenes.find(
        (imagen) => imagen.principal,
      ) ??
      producto.imagenes[0] ??
      null;

    return {
      mensaje:
        'Detalle del producto obtenido correctamente',
      producto: {
        ...producto,
        precio: Number(producto.precio),
        disponible: producto.stock > 0,
        imagenPrincipal,
      },
    };
  }

  buscarPorImagen(
    archivo: ImagenParaProcesar,
    correlationId: string,
  ) {
    return this.productoImagenesService
      .buscarProductosPorImagen(
        archivo,
        correlationId,
      );
  }
}