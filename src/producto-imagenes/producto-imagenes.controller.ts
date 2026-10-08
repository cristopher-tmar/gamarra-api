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
import {
    ApiBadGatewayResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { ProductoImagenesService } from './producto-imagenes.service';
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
@ApiBearerAuth()
@ApiUnauthorizedResponse({
    description:
        'No se proporcionó un access token válido',
})
@ApiForbiddenResponse({
    description:
        'El usuario no tiene permisos sobre la imagen o el producto indicado',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
)
@Controller('producto-imagenes')
export class ProductoImagenesController {
    constructor(
        private readonly productoImagenesService:
            ProductoImagenesService,
    ) { }

    @Post(':imagenId/procesar')
    @ApiOperation({
        summary:
            'Reprocesar el embedding de una imagen',
        description:
            'Vuelve a procesar una imagen registrada y actualiza su embedding, metadatos y estado de procesamiento.',
    })
    @ApiParam({
        name: 'imagenId',
        description:
            'Identificador de la imagen que se desea reprocesar',
        type: Number,
        example: 24,
    })
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
    @ApiOkResponse({
        description:
            'Imagen procesada y embedding actualizado correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'No se proporcionó una imagen, el identificador no es válido o el servicio devolvió una dimensión incorrecta',
    })
    @ApiNotFoundResponse({
        description:
            'No existe una imagen con el identificador indicado',
    })
    @ApiBadGatewayResponse({
        description:
            'El servicio de visión no se encuentra disponible o no pudo procesar la imagen',
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
    @ApiOperation({
        summary:
            'Establecer una imagen como principal',
        description:
            'Establece la imagen indicada como principal y reorganiza las demás imágenes del producto.',
    })
    @ApiParam({
        name: 'imagenId',
        description:
            'Identificador de la imagen',
        type: Number,
        example: 24,
    })
    @ApiOkResponse({
        description:
            'Imagen establecida como principal correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'El identificador de la imagen no es válido',
    })
    @ApiNotFoundResponse({
        description:
            'No existe una imagen con el identificador indicado',
    })
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
    @ApiOperation({
        summary:
            'Eliminar una imagen de producto',
        description:
            'Elimina la imagen, su embedding y el archivo correspondiente de Supabase. Si la imagen era principal, asigna otra automáticamente.',
    })
    @ApiParam({
        name: 'imagenId',
        description:
            'Identificador de la imagen que se desea eliminar',
        type: Number,
        example: 24,
    })
    @ApiOkResponse({
        description:
            'Imagen eliminada correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'El identificador de la imagen no es válido',
    })
    @ApiNotFoundResponse({
        description:
            'No existe una imagen con el identificador indicado',
    })
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