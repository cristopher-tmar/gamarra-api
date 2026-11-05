import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';
import {
  TipoEventoComportamiento,
} from '../generated/prisma/enums';
import {
  PrismaService,
} from '../prisma/prisma.service';
import {
  RegistrarEventoDto,
} from './dto/registrar-evento.dto';

@Injectable()
export class EventosComportamientoService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) { }

  async registrar(
    registrarEventoDto:
      RegistrarEventoDto,
    usuarioId?: number,
  ) {
    this.validarContexto(
      registrarEventoDto,
    );

    if (
      registrarEventoDto.productoId !==
      undefined
    ) {
      await this.validarProducto(
        registrarEventoDto.productoId,
      );
    }

    const metadata =
      registrarEventoDto.metadata as
      | Prisma.InputJsonValue
      | undefined;

    const evento =
      await this.prisma
        .eventoComportamiento
        .create({
          data: {
            tipo:
              registrarEventoDto.tipo,
            usuarioId:
              usuarioId ?? null,
            productoId:
              registrarEventoDto
                .productoId ?? null,
            sessionId:
              registrarEventoDto
                .sessionId,
            terminoBusqueda:
              registrarEventoDto
                .terminoBusqueda
                ?.trim() || null,
            metadata,
          },
          select: {
            id: true,
            tipo: true,
            usuarioId: true,
            productoId: true,
            sessionId: true,
            terminoBusqueda: true,
            metadata: true,
            fechaEvento: true,
          },
        });

    return {
      mensaje:
        'Evento registrado correctamente',
      evento,
    };
  }

  private validarContexto(
    dto: RegistrarEventoDto,
  ): void {
    const eventosConProducto:
      TipoEventoComportamiento[] = [
        TipoEventoComportamiento
          .PRODUCTO_VISTO,
        TipoEventoComportamiento
          .FAVORITO_AGREGADO,
        TipoEventoComportamiento
          .FAVORITO_ELIMINADO,
        TipoEventoComportamiento
          .RESULTADO_SELECCIONADO,
        TipoEventoComportamiento
          .CONTACTO_WHATSAPP,
      ];

    if (
      eventosConProducto.includes(
        dto.tipo,
      ) &&
      dto.productoId === undefined
    ) {
      throw new BadRequestException(
        `El evento ${dto.tipo} requiere un productoId`,
      );
    }

    if (
      dto.tipo ===
      TipoEventoComportamiento
        .BUSQUEDA_TEXTO &&
      !dto.terminoBusqueda?.trim()
    ) {
      throw new BadRequestException(
        'El evento BUSQUEDA_TEXTO requiere un terminoBusqueda',
      );
    }
  }

  private async validarProducto(
    productoId: number,
  ): Promise<void> {
    const producto =
      await this.prisma.producto
        .findFirst({
          where: {
            id: productoId,
            estado: true,
            tienda: {
              estado: true,
            },
          },
          select: {
            id: true,
          },
        });

    if (!producto) {
      throw new NotFoundException(
        'El producto relacionado con el evento no existe o no está disponible',
      );
    }
  }
}