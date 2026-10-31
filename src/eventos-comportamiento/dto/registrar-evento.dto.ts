import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import {
  TipoEventoComportamiento,
} from '../../generated/prisma/enums';

export class RegistrarEventoDto {
  @ApiProperty({
    description:
      'Tipo de interacción realizada por el visitante o usuario',
    enum: TipoEventoComportamiento,
    example:
      TipoEventoComportamiento.PRODUCTO_VISTO,
  })
  @IsEnum(
    TipoEventoComportamiento,
    {
      message:
        'El tipo de evento no es válido',
    },
  )
  tipo: TipoEventoComportamiento;

  @ApiProperty({
    description:
      'Identificador UUID de la sesión del navegador',
    type: String,
    format: 'uuid',
    example:
      '1a64beef-99e4-4ecc-9aaf-c95264276910',
  })
  @IsString({
    message:
      'El identificador de sesión debe ser una cadena',
  })
  @IsUUID('4', {
    message:
      'El identificador de sesión debe ser un UUID válido',
  })
  @MaxLength(100, {
    message:
      'El identificador de sesión no puede superar los 100 caracteres',
  })
  sessionId: string;

  @ApiPropertyOptional({
    description:
      'Identificador del producto relacionado con el evento',
    type: Number,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({
    message:
      'El identificador del producto debe ser un número entero',
  })
  @Min(1, {
    message:
      'El identificador del producto debe ser mayor que 0',
  })
  productoId?: number;

  @ApiPropertyOptional({
    description:
      'Texto ingresado en una búsqueda',
    type: String,
    example: 'casaca oversize',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({
    message:
      'El término de búsqueda debe ser una cadena',
  })
  @MaxLength(200, {
    message:
      'El término de búsqueda no puede superar los 200 caracteres',
  })
  terminoBusqueda?: string;

  @ApiPropertyOptional({
    description:
      'Información adicional del contexto del evento',
    type: Object,
    example: {
      origen: 'catalogo',
      categoria: 'Casacas',
      posicionResultado: 2,
    },
  })
  @IsOptional()
  @IsObject({
    message:
      'La metadata debe ser un objeto',
  })
  metadata?: Record<string, unknown>;
}