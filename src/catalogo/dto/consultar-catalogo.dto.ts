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
  pagina = 1;

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
  limite = 12;

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