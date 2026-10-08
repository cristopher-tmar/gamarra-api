import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ConsultarCatalogoDto {
  @ApiPropertyOptional({
    description:
      'Número de página que se desea consultar',
    type: Number,
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message:
      'La página debe ser un número entero',
  })
  @Min(1, {
    message:
      'La página debe ser mayor o igual que 1',
  })
  pagina: number = 1;

  @ApiPropertyOptional({
    description:
      'Cantidad máxima de productos por página',
    type: Number,
    example: 12,
    default: 12,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message:
      'El límite debe ser un número entero',
  })
  @Min(1, {
    message:
      'El límite debe ser mayor o igual que 1',
  })
  @Max(50, {
    message:
      'El límite no puede ser mayor que 50',
  })
  limite: number = 12;

  @ApiPropertyOptional({
    description:
      'Texto utilizado para buscar por código, nombre, categoría o descripción',
    type: String,
    example: 'oversize',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message:
      'El texto de búsqueda debe ser una cadena',
  })
  @MaxLength(100, {
    message:
      'El texto de búsqueda no puede superar los 100 caracteres',
  })
  buscar?: string;

  @ApiPropertyOptional({
    description:
      'Categoría exacta de los productos',
    type: String,
    example: 'Polos',
    maxLength: 80,
  })
  @IsOptional()
  @IsString({
    message:
      'La categoría debe ser una cadena',
  })
  @MaxLength(80, {
    message:
      'La categoría no puede superar los 80 caracteres',
  })
  categoria?: string;

  @ApiPropertyOptional({
    description:
      'Identificador de la tienda cuyos productos se desean consultar',
    type: Number,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message:
      'El identificador de la tienda debe ser un número entero',
  })
  @Min(1, {
    message:
      'El identificador de la tienda debe ser mayor que 0',
  })
  tiendaId?: number;
}