import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description:
      'Identificador de la tienda donde se registrará el producto',
    type: Number,
    example: 1,
    minimum: 1,
  })
  @IsInt({
    message:
      'El identificador de la tienda debe ser un número entero',
  })
  @Min(1, {
    message:
      'El identificador de la tienda debe ser mayor que 0',
  })
  tiendaId: number;

  @ApiProperty({
    description:
      'Código único del producto',
    type: String,
    example: 'POL-001',
    maxLength: 20,
  })
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

  @ApiProperty({
    description:
      'Nombre comercial del producto',
    type: String,
    example: 'Polo oversize marrón',
    maxLength: 150,
  })
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

  @ApiProperty({
    description:
      'Categoría a la que pertenece el producto',
    type: String,
    example: 'Polos',
    maxLength: 80,
  })
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

  @ApiPropertyOptional({
    description:
      'Descripción general del producto',
    type: String,
    example:
      'Polo de algodón de corte oversize y manga corta',
    maxLength: 500,
  })
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

  @ApiProperty({
    description:
      'Precio unitario del producto, con un máximo de dos decimales',
    type: Number,
    example: 59.9,
    minimum: 0,
  })
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

  @ApiProperty({
    description:
      'Cantidad disponible del producto',
    type: Number,
    example: 20,
    minimum: 0,
  })
  @IsInt({
    message:
      'El stock debe ser un número entero',
  })
  @Min(0, {
    message:
      'El stock no puede ser menor que 0',
  })
  stock: number;

  @ApiPropertyOptional({
    description:
      'Características adicionales del producto en formato JSON',
    type: 'object',
    example: {
      marca: 'Topitop',
      estilo: 'Oversize',
      material: 'Algodón',
      tallas: ['S', 'M', 'L'],
      colores: ['Marrón'],
      tipoManga: 'Corta',
      tipoCuello: 'Redondo',
    },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({
    message:
      'Los atributos deben enviarse como un objeto JSON',
  })
  atributos?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Indica si el producto se encuentra activo',
    type: Boolean,
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({
    message:
      'El estado debe ser un valor verdadero o falso',
  })
  estado?: boolean;
}