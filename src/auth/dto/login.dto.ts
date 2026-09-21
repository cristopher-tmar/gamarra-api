import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class LoginDto {
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