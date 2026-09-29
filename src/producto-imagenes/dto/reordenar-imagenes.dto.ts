import {
    ArrayMinSize,
    IsArray,
    IsInt,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrdenImagenDto {
    @IsInt({
        message:
            'El identificador de la imagen debe ser un número entero',
    })
    @Min(1, {
        message:
            'El identificador de la imagen debe ser mayor que 0',
    })
    imagenId: number;

    @IsInt({
        message:
            'El orden de la imagen debe ser un número entero',
    })
    @Min(1, {
        message:
            'El orden de la imagen debe ser mayor que 0',
    })
    orden: number;
}

export class ReordenarImagenesDto {
    @IsArray({
        message:
            'Las imágenes deben enviarse como una lista',
    })
    @ArrayMinSize(1, {
        message:
            'Debe proporcionar al menos una imagen',
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => OrdenImagenDto)
    imagenes: OrdenImagenDto[];
}