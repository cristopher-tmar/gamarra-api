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
    ApiBody,
    ApiConsumes,
    ApiQuery,
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
    @ApiQuery({
        name: 'pagina',
        required: false,
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: 'limite',
        required: false,
        type: Number,
        example: 12,
    })
    @ApiQuery({
        name: 'buscar',
        required: false,
        type: String,
        example: 'oversize',
    })
    @ApiQuery({
        name: 'categoria',
        required: false,
        type: String,
        example: 'Polos',
    })
    @ApiQuery({
        name: 'tiendaId',
        required: false,
        type: Number,
        example: 1,
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