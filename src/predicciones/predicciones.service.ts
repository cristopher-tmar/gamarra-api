import {
  Injectable,
} from '@nestjs/common';

import {
  TipoEventoComportamiento,
} from '../generated/prisma/enums';
import {
  PrismaService,
} from '../prisma/prisma.service';

interface ProductoPrediction {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  tiendaId: number;
  tiendaNombre: string;
  score: number;
  totalInteracciones: number;
  eventos: Record<string, number>;
}

interface CategoriaPrediction {
  categoria: string;
  score: number;
  totalInteracciones: number;
  productos: Set<number>;
}

@Injectable()
export class PrediccionesService {
  private readonly eventWeights:
    Record<
      TipoEventoComportamiento,
      number
    > = {
      PRODUCTO_VISTO: 1,
      FAVORITO_AGREGADO: 4,
      FAVORITO_ELIMINADO: -2,
      BUSQUEDA_TEXTO: 1,
      BUSQUEDA_VISUAL: 2,
      RESULTADO_SELECCIONADO: 3,
      CONTACTO_WHATSAPP: 6,
    };

  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async calcularResumen(
    dias: number = 30,
  ) {
    const fechaInicio = new Date();

    fechaInicio.setDate(
      fechaInicio.getDate() - dias,
    );

    const eventos =
      await this.prisma
        .eventoComportamiento
        .findMany({
          where: {
            fechaEvento: {
              gte: fechaInicio,
            },
          },
          select: {
            id: true,
            tipo: true,
            productoId: true,
            usuarioId: true,
            sessionId: true,
            fechaEvento: true,
            producto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                categoria: true,
                precio: true,
                tienda: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
          orderBy: {
            fechaEvento: 'desc',
          },
        });

    const productosMap =
      new Map<
        number,
        ProductoPrediction
      >();

    const categoriasMap =
      new Map<
        string,
        CategoriaPrediction
      >();

    const distribucionEventos:
      Record<string, number> = {};

    const usuarios =
      new Set<number>();

    const sesiones =
      new Set<string>();

    let scoreTotal = 0;

    for (const evento of eventos) {
      const peso =
        this.eventWeights[
          evento.tipo
        ];

      distribucionEventos[
        evento.tipo
      ] =
        (
          distribucionEventos[
            evento.tipo
          ] ?? 0
        ) + 1;

      scoreTotal += peso;

      if (evento.usuarioId) {
        usuarios.add(
          evento.usuarioId,
        );
      }

      sesiones.add(
        evento.sessionId,
      );

      if (
        !evento.productoId ||
        !evento.producto
      ) {
        continue;
      }

      const producto =
        evento.producto;

      const predictionActual =
        productosMap.get(
          producto.id,
        );

      if (predictionActual) {
        predictionActual.score += peso;

        predictionActual
          .totalInteracciones += 1;

        predictionActual.eventos[
          evento.tipo
        ] =
          (
            predictionActual.eventos[
              evento.tipo
            ] ?? 0
          ) + 1;
      } else {
        productosMap.set(
          producto.id,
          {
            productoId:
              producto.id,
            codigo:
              producto.codigo,
            nombre:
              producto.nombre,
            categoria:
              producto.categoria,
            precio:
              Number(
                producto.precio,
              ),
            tiendaId:
              producto.tienda.id,
            tiendaNombre:
              producto.tienda
                .nombre,
            score: peso,
            totalInteracciones: 1,
            eventos: {
              [evento.tipo]: 1,
            },
          },
        );
      }

      const categoriaActual =
        categoriasMap.get(
          producto.categoria,
        );

      if (categoriaActual) {
        categoriaActual.score +=
          peso;

        categoriaActual
          .totalInteracciones += 1;

        categoriaActual
          .productos.add(
            producto.id,
          );
      } else {
        categoriasMap.set(
          producto.categoria,
          {
            categoria:
              producto.categoria,
            score: peso,
            totalInteracciones: 1,
            productos:
              new Set([
                producto.id,
              ]),
          },
        );
      }
    }

    const productosConMayorInteres =
      Array.from(
        productosMap.values(),
      )
        .sort(
          (a, b) =>
            b.score - a.score,
        )
        .slice(0, 5)
        .map(
          (producto, index) => ({
            posicion: index + 1,
            ...producto,
            tendencia:
              this.obtenerTendencia(
                producto.score,
              ),
          }),
        );

    const categoriasConMayorInteres =
      Array.from(
        categoriasMap.values(),
      )
        .map((categoria) => ({
          categoria:
            categoria.categoria,
          score:
            categoria.score,
          totalInteracciones:
            categoria
              .totalInteracciones,
          totalProductos:
            categoria
              .productos.size,
          tendencia:
            this.obtenerTendencia(
              categoria.score,
            ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score,
        )
        .slice(0, 5);

    return {
      modelo: {
        nombre:
          'Modelo ponderado de intención comercial',
        version: '1.0',
        tipo:
          'SCORING_PREDICTIVO',
        pesos:
          this.eventWeights,
      },
      periodo: {
        dias,
        fechaInicio,
        fechaFin: new Date(),
      },
      resumen: {
        totalEventos:
          eventos.length,
        scoreTotal,
        usuariosIdentificados:
          usuarios.size,
        sesionesAnalizadas:
          sesiones.size,
        productosAnalizados:
          productosMap.size,
        categoriasAnalizadas:
          categoriasMap.size,
      },
      productoConMayorInteres:
        productosConMayorInteres[
          0
        ] ?? null,
      categoriaConMayorInteres:
        categoriasConMayorInteres[
          0
        ] ?? null,
      productosConMayorInteres,
      categoriasConMayorInteres,
      distribucionEventos,
    };
  }

  private obtenerTendencia(
    score: number,
  ): 'ALTA' | 'MEDIA' | 'BAJA' {
    if (score >= 15) {
      return 'ALTA';
    }

    if (score >= 6) {
      return 'MEDIA';
    }

    return 'BAJA';
  }
}