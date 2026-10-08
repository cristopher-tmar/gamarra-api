import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolUsuario } from '../../generated/prisma/enums';

export class RegisterDto {
  @ApiProperty({
    description:
      'Nombres del usuario',
    example: 'Cristopher',
    maxLength: 100,
  })
  @IsString({
    message:
      'Los nombres deben ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'Los nombres son obligatorios',
  })
  @MaxLength(100, {
    message:
      'Los nombres no pueden superar los 100 caracteres',
  })
  nombres: string;

  @ApiProperty({
    description:
      'Apellidos del usuario',
    example: 'Torres Martínez',
    maxLength: 100,
  })
  @IsString({
    message:
      'Los apellidos deben ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'Los apellidos son obligatorios',
  })
  @MaxLength(100, {
    message:
      'Los apellidos no pueden superar los 100 caracteres',
  })
  apellidos: string;

  @ApiProperty({
    description:
      'Correo electrónico del usuario',
    example: 'comerciante@gamarra.pe',
    maxLength: 150,
  })
  @IsEmail(
    {},
    {
      message:
        'El correo electrónico no tiene un formato válido',
    },
  )
  @IsNotEmpty({
    message:
      'El correo electrónico es obligatorio',
  })
  @MaxLength(150, {
    message:
      'El correo electrónico no puede superar los 150 caracteres',
  })
  correo: string;

  @ApiProperty({
    description:
      'Contraseña con mayúscula, minúscula, número y carácter especial',
    example: 'ClaveSegura123!',
    minLength: 8,
    maxLength: 72,
    format: 'password',
  })
  @IsString({
    message:
      'La contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'La contraseña es obligatoria',
  })
  @MinLength(8, {
    message:
      'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(72, {
    message:
      'La contraseña no puede superar los 72 caracteres',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    {
      message:
        'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  password: string;

  @ApiProperty({
    description:
      'Rol inicial del usuario',
    enum: [
      RolUsuario.COMERCIANTE,
      RolUsuario.CLIENTE,
    ],
    example: RolUsuario.COMERCIANTE,
  })
  @IsIn(
    [
      RolUsuario.COMERCIANTE,
      RolUsuario.CLIENTE,
    ],
    {
      message:
        'El rol debe ser COMERCIANTE o CLIENTE',
    },
  )
  rol: RolUsuario;
}