import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTiendaDto {
  @ApiProperty({
    description:
      'Código único de la tienda',
    type: String,
    example: 'TIE-003',
    maxLength: 20,
  })
  @IsString({
    message:
      'El código de la tienda debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El código de la tienda es obligatorio',
  })
  @MaxLength(20, {
    message:
      'El código de la tienda no puede superar los 20 caracteres',
  })
  codigo: string;

  @ApiProperty({
    description:
      'Nombre comercial de la tienda',
    type: String,
    example: 'Moda Urbana Gamarra',
    maxLength: 150,
  })
  @IsString({
    message:
      'El nombre de la tienda debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El nombre de la tienda es obligatorio',
  })
  @MaxLength(150, {
    message:
      'El nombre de la tienda no puede superar los 150 caracteres',
  })
  nombre: string;

  @ApiPropertyOptional({
    description:
      'Descripción general de la tienda',
    type: String,
    example:
      'Tienda especializada en prendas urbanas y casuales',
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
      'Nombre de la galería donde se encuentra la tienda',
    type: String,
    example: 'Galería Azul',
    maxLength: 150,
  })
  @IsString({
    message:
      'La galería debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'La galería es obligatoria',
  })
  @MaxLength(150, {
    message:
      'La galería no puede superar los 150 caracteres',
  })
  galeria: string;

  @ApiPropertyOptional({
    description:
      'Piso donde se encuentra el local',
    type: String,
    example: '2',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({
    message:
      'El piso debe ser una cadena de texto',
  })
  @MaxLength(20, {
    message:
      'El piso no puede superar los 20 caracteres',
  })
  piso?: string;

  @ApiProperty({
    description:
      'Número o código del local',
    type: String,
    example: '205',
    maxLength: 30,
  })
  @IsString({
    message:
      'El número de local debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El número de local es obligatorio',
  })
  @MaxLength(30, {
    message:
      'El número de local no puede superar los 30 caracteres',
  })
  numeroLocal: string;

  @ApiPropertyOptional({
    description:
      'Número telefónico de contacto de la tienda',
    type: String,
    example: '999888777',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({
    message:
      'El teléfono debe ser una cadena de texto',
  })
  @MaxLength(20, {
    message:
      'El teléfono no puede superar los 20 caracteres',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description:
      'Indica si la tienda se encuentra activa',
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