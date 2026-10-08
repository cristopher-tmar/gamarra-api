import { ApiProperty } from '@nestjs/swagger';
import {
  IsJWT,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Refresh token utilizado para renovar la sesión o cerrar sesión',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({
    message:
      'El refresh token debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message:
      'El refresh token es obligatorio',
  })
  @IsJWT({
    message:
      'El refresh token no tiene un formato válido',
  })
  refreshToken: string;
}