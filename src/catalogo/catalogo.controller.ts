import {
    BadRequestException,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BusquedaVisualThrottlerGuard } from './guards/busqueda-visual-throttler.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadGatewayResponse,
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { CatalogoService } from './catalogo.service';
import { ConsultarCatalogoDto } from './dto/consultar-catalogo.dto';

interface UploadedImage {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

@ApiTags('catalogo')
@Controller('catalogo')
export class CatalogoController {
    constructor(
        private readonly catalogoService:
            CatalogoService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Consultar el catálogo público',
        description:
            'Devuelve los productos disponibles mediante una respuesta paginada. Permite filtrar por texto, categoría y tienda.',
    })
    @ApiOkResponse({
        description:
            'Catálogo consultado correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'Uno o más filtros de búsqueda no son válidos',
    })
    listar(
        @Query()
        consultarCatalogoDto:
            ConsultarCatalogoDto,
    ) {
        return this.catalogoService.listar(
            consultarCatalogoDto,
        );
    }

    /*
     * Esta ruta debe permanecer antes de :productoId,
     * para evitar que NestJS interprete "busqueda-visual"
     * como el identificador de un producto.
     */
    @Post('busqueda-visual')
    @ApiOperation({
        summary: 'Buscar productos mediante una imagen',
        description:
            'Recibe una imagen y devuelve productos visualmente similares. La operación está limitada a 10 solicitudes por minuto.',
    })
    @UseGuards(BusquedaVisualThrottlerGuard)
    @Throttle({
        busquedaVisual: {
            limit: 10,
            ttl: 60_000,
        },
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
                        'Imagen utilizada para buscar productos visualmente similares',
                },
            },
        },
    })
    @ApiOkResponse({
        description:
            'Búsqueda visual realizada correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'No se proporcionó una imagen o el archivo no es válido',
    })
    @ApiResponse({
        status: 429,
        description:
            'Se superó el límite permitido de búsquedas visuales',
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
    buscarPorImagen(
        @UploadedFile()
        archivo: UploadedImage,
        @Req()
        request: RequestWithCorrelationId,
    ) {
        if (!archivo) {
            throw new BadRequestException(
                'Debe proporcionar una imagen para realizar la búsqueda visual',
            );
        }

        return this.catalogoService.buscarPorImagen(
            archivo,
            request.correlationId,
        );
    }

    @Get(':productoId')
    @ApiOperation({
        summary: 'Obtener el detalle público de un producto',
        description:
            'Devuelve la información pública de un producto disponible, incluyendo su tienda y sus imágenes procesadas.',
    })
    @ApiParam({
        name: 'productoId',
        description: 'Identificador del producto',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description:
            'Detalle del producto obtenido correctamente',
    })
    @ApiBadRequestResponse({
        description:
            'El identificador del producto no es válido',
    })
    @ApiNotFoundResponse({
        description:
            'El producto no existe, está inactivo o pertenece a una tienda inactiva',
    })
    obtenerDetalle(
        @Param(
            'productoId',
            ParseIntPipe,
        )
        productoId: number,
    ) {
        return this.catalogoService
            .obtenerDetalle(productoId);
    }
}