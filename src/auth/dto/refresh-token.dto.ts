import {
  IsJWT,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RefreshTokenDto {
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