import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTiendaDto {
  @IsString({
    message: 'El código de la tienda debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El código de la tienda es obligatorio',
  })
  @MaxLength(20, {
    message: 'El código de la tienda no puede superar los 20 caracteres',
  })
  codigo: string;

  @IsString({
    message: 'El nombre de la tienda debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre de la tienda es obligatorio',
  })
  @MaxLength(150, {
    message: 'El nombre de la tienda no puede superar los 150 caracteres',
  })
  nombre: string;

  @IsOptional()
  @IsString({
    message: 'La descripción debe ser una cadena de texto',
  })
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  descripcion?: string;

  @IsString({
    message: 'La galería debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La galería es obligatoria',
  })
  @MaxLength(150, {
    message: 'La galería no puede superar los 150 caracteres',
  })
  galeria: string;

  @IsOptional()
  @IsString({
    message: 'El piso debe ser una cadena de texto',
  })
  @MaxLength(20, {
    message: 'El piso no puede superar los 20 caracteres',
  })
  piso?: string;

  @IsString({
    message: 'El número de local debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El número de local es obligatorio',
  })
  @MaxLength(30, {
    message: 'El número de local no puede superar los 30 caracteres',
  })
  numeroLocal: string;

  @IsOptional()
  @IsString({
    message: 'El teléfono debe ser una cadena de texto',
  })
  @MaxLength(20, {
    message: 'El teléfono no puede superar los 20 caracteres',
  })
  telefono?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado debe ser un valor verdadero o falso',
  })
  estado?: boolean;

}