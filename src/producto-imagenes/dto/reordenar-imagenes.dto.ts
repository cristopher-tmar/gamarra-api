import {
  ApiProperty,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrdenImagenDto {
  @ApiProperty({
    description:
      'Identificador de la imagen',
    type: Number,
    example: 24,
    minimum: 1,
  })
  @IsInt({
    message:
      'El identificador de la imagen debe ser un número entero',
  })
  @Min(1, {
    message:
      'El identificador de la imagen debe ser mayor que 0',
  })
  imagenId: number;

  @ApiProperty({
    description:
      'Nueva posición de la imagen dentro del producto',
    type: Number,
    example: 1,
    minimum: 1,
  })
  @IsInt({
    message:
      'El orden de la imagen debe ser un número entero',
  })
  @Min(1, {
    message:
      'El orden de la imagen debe ser mayor que 0',
  })
  orden: number;
}

export class ReordenarImagenesDto {
  @ApiProperty({
    description:
      'Lista completa de imágenes con su nuevo orden. La imagen con orden 1 será establecida como principal.',
    type: [OrdenImagenDto],
    example: [
      {
        imagenId: 24,
        orden: 1,
      },
      {
        imagenId: 25,
        orden: 2,
      },
      {
        imagenId: 26,
        orden: 3,
      },
    ],
  })
  @IsArray({
    message:
      'Las imágenes deben enviarse como una lista',
  })
  @ArrayMinSize(1, {
    message:
      'Debe proporcionar al menos una imagen',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => OrdenImagenDto)
  imagenes: OrdenImagenDto[];
}