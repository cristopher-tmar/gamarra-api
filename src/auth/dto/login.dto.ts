import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description:
      'Correo electrónico registrado del usuario',
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
      'Contraseña de acceso del usuario',
    example: 'ClaveSegura123',
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
  password: string;
}