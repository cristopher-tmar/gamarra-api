import {
  BadRequestException,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Body,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import type {
  AuthenticatedRequest,
} from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { ProductoImagenesService } from './producto-imagenes.service';
import { ReordenarImagenesDto } from './dto/reordenar-imagenes.dto';

interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

type AuthenticatedCorrelationRequest =
  AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags('productos')
@Controller('productos')
export class ProductoImagenesUploadController {
  constructor(
    private readonly productoImagenesService:
      ProductoImagenesService,
  ) { }

  
  buscarProductosPorImagen(
    @UploadedFile()
    archivo: UploadedImage,
    @Req()
    request: AuthenticatedCorrelationRequest,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debe proporcionar una imagen para realizar la búsqueda visual',
      );
    }

    return this.productoImagenesService
      .buscarProductosPorImagen(
        archivo,
        request.correlationId,
      );
  }

  @Post(':productoId/imagenes')
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
  registrarImagen(
    @Param('productoId', ParseIntPipe)
    productoId: number,
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

    return this.productoImagenesService
      .registrarYProcesarImagen(
        productoId,
        archivo,
        request.correlationId,
        request.usuario,
      );
  }

  @Get(':productoId/imagenes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  listarImagenes(
    @Param('productoId', ParseIntPipe)
    productoId: number,
    @Req()
    request: AuthenticatedCorrelationRequest,
  ) {
    return this.productoImagenesService
      .listarImagenesPorProducto(
        productoId,
        request.usuario,
      );
  }

  @Patch(':productoId/imagenes/orden')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  reordenarImagenes(
    @Param('productoId', ParseIntPipe)
    productoId: number,
    @Body()
    reordenarImagenesDto: ReordenarImagenesDto,
    @Req()
    request: AuthenticatedCorrelationRequest,
  ) {
    return this.productoImagenesService
      .reordenarImagenes(
        productoId,
        reordenarImagenesDto,
        request.usuario,
      );
  }

}