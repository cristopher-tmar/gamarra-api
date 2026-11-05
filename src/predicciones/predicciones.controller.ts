import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  PrediccionesService,
} from './predicciones.service';

@ApiTags('predicciones')
@Controller('predicciones')
export class PrediccionesController {
  constructor(
    private readonly prediccionesService:
      PrediccionesService,
  ) {}

  @Get('resumen')
  @ApiOperation({
    summary:
      'Obtener el resumen predictivo de interés comercial',
    description:
      'Calcula rankings de productos y categorías mediante las señales de comportamiento registradas.',
  })
  @ApiQuery({
    name: 'dias',
    required: false,
    type: Number,
    example: 30,
    description:
      'Cantidad de días que se analizarán',
  })
  @ApiOkResponse({
    description:
      'Resumen predictivo calculado correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'La cantidad de días no es válida',
  })
  obtenerResumen(
    @Query(
      'dias',
      new DefaultValuePipe(30),
      ParseIntPipe,
    )
    dias: number,
  ) {
    return this.prediccionesService
      .calcularResumen(dias);
  }
}