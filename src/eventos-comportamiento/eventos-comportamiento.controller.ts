import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  OptionalJwtAuthGuard,
} from '../auth/guards/optional-jwt-auth.guard';
import type {
  OptionalAuthenticatedRequest,
} from '../auth/guards/optional-jwt-auth.guard';
import {
  RegistrarEventoDto,
} from './dto/registrar-evento.dto';
import {
  EventosComportamientoService,
} from './eventos-comportamiento.service';

@ApiTags('eventos-comportamiento')
@ApiBearerAuth()
@Controller('eventos-comportamiento')
@UseGuards(OptionalJwtAuthGuard)
export class EventosComportamientoController {
  constructor(
    private readonly eventosService:
      EventosComportamientoService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar un evento de comportamiento',
    description:
      'Registra interacciones de visitantes anónimos o usuarios autenticados. El token Bearer es opcional.',
  })
  @ApiCreatedResponse({
    description:
      'Evento registrado correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El evento no tiene el contexto requerido',
  })
  @ApiUnauthorizedResponse({
    description:
      'Se proporcionó un token inválido o expirado',
  })
  registrar(
    @Body()
    registrarEventoDto:
      RegistrarEventoDto,
    @Req()
    request:
      OptionalAuthenticatedRequest,
  ) {
    return this.eventosService
      .registrar(
        registrarEventoDto,
        request.usuario?.sub,
      );
  }
}