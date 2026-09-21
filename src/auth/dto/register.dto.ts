import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolUsuario } from '../../generated/prisma/enums';

export class RegisterDto {
  @IsString({
    message: 'Los nombres deben ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'Los nombres son obligatorios',
  })
  @MaxLength(100, {
    message: 'Los nombres no pueden superar los 100 caracteres',
  })
  nombres: string;

  @IsString({
    message: 'Los apellidos deben ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'Los apellidos son obligatorios',
  })
  @MaxLength(100, {
    message: 'Los apellidos no pueden superar los 100 caracteres',
  })
  apellidos: string;

  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido',
    },
  )
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  @MaxLength(150, {
    message: 'El correo electrónico no puede superar los 150 caracteres',
  })
  correo: string;

  @IsString({
    message: 'La contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial',
  })
  password: string;

  @IsEnum(RolUsuario, {
    message:
      'El rol debe ser ADMINISTRADOR, COMERCIANTE o CLIENTE',
  })
  rol: RolUsuario;
}