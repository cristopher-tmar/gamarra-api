import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsInt({
    message:
      'El identificador de la tienda debe ser un número entero',
  })
  @Min(1, {
    message:
      'El identificador de la tienda debe ser mayor que 0',
  })
  tiendaId: number;

  @IsString({
    message:
      'El código del producto debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El código del producto es obligatorio',
  })
  @MaxLength(20, {
    message:
      'El código del producto no puede superar los 20 caracteres',
  })
  codigo: string;

  @IsString({
    message:
      'El nombre del producto debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El nombre del producto es obligatorio',
  })
  @MaxLength(150, {
    message:
      'El nombre del producto no puede superar los 150 caracteres',
  })
  nombre: string;

  @IsString({
    message:
      'La categoría debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'La categoría del producto es obligatoria',
  })
  @MaxLength(80, {
    message:
      'La categoría no puede superar los 80 caracteres',
  })
  categoria: string;

  @IsOptional()
  @IsString({
    message:
      'La descripción debe ser una cadena de texto',
  })
  @MaxLength(500, {
    message:
      'La descripción no puede superar los 500 caracteres',
  })
  descripcion?: string;

  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'El precio debe ser un número con máximo dos decimales',
    },
  )
  @Min(0, {
    message:
      'El precio no puede ser menor que 0',
  })
  precio: number;

  @IsInt({
    message:
      'El stock debe ser un número entero',
  })
  @Min(0, {
    message:
      'El stock no puede ser menor que 0',
  })
  stock: number;

  @IsOptional()
  @IsObject({
    message:
      'Los atributos deben enviarse como un objeto JSON',
  })
  atributos?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean({
    message:
      'El estado debe ser un valor verdadero o falso',
  })
  estado?: boolean;
}