import {
    BadRequestException,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Patch,
    Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBody,
    ApiConsumes,
    ApiTags,
} from '@nestjs/swagger';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { ProductoImagenesService } from './producto-imagenes.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import {
    AuthenticatedRequest,
    JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';

interface UploadedImage {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

type AuthenticatedCorrelationRequest =
    AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags('producto-imagenes')
@Controller('producto-imagenes')
export class ProductoImagenesController {
    constructor(
        private readonly productoImagenesService:
            ProductoImagenesService,
    ) { }

    @Post(':imagenId/procesar')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(
        RolUsuario.ADMINISTRADOR,
        RolUsuario.COMERCIANTE,
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['archivo'],
            properties: {
                archivo: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Imagen JPG, JPEG, PNG o WebP del producto',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('archivo', {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
        }),
    )
    procesarEmbedding(
        @Param('imagenId', ParseIntPipe)
        imagenId: number,
        @UploadedFile()
        archivo: UploadedImage,
        @Req()
        request: AuthenticatedCorrelationRequest,
    ) {
        if (!archivo) {
            throw new BadRequestException(
                'Debe proporcionar una imagen',
            );
        }

        return this.productoImagenesService.procesarEmbedding(
            imagenId,
            archivo,
            request.correlationId,
            request.usuario,
        );
    }

    @Patch(':imagenId/principal')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(
        RolUsuario.ADMINISTRADOR,
        RolUsuario.COMERCIANTE,
    )
    establecerComoPrincipal(
        @Param('imagenId', ParseIntPipe)
        imagenId: number,
        @Req()
        request: AuthenticatedCorrelationRequest,
    ) {
        return this.productoImagenesService
            .establecerComoPrincipal(
                imagenId,
                request.usuario,
            );
    }

    @Delete(':imagenId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(
        RolUsuario.ADMINISTRADOR,
        RolUsuario.COMERCIANTE,
    )
    eliminarImagen(
        @Param('imagenId', ParseIntPipe)
        imagenId: number,
        @Req()
        request: AuthenticatedCorrelationRequest,
    ) {
        return this.productoImagenesService.eliminarImagen(
            imagenId,
            request.usuario,
        );
    }
}