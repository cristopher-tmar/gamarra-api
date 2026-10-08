import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import type {
  AuthenticatedRequest,
} from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { ReordenarImagenesDto } from './dto/reordenar-imagenes.dto';
import { ProductoImagenesService } from './producto-imagenes.service';

interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

type AuthenticatedCorrelationRequest =
  AuthenticatedRequest &
  RequestWithCorrelationId;

@ApiTags('productos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'No se proporcionó un access token válido',
})
@ApiForbiddenResponse({
  description:
    'El usuario no tiene permisos sobre el producto indicado',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COMERCIANTE,
)
@Controller('productos')
export class ProductoImagenesUploadController {
  constructor(
    private readonly productoImagenesService:
      ProductoImagenesService,
  ) {}

  @Post(':productoId/imagenes')
  @ApiOperation({
    summary:
      'Registrar y procesar una imagen del producto',
    description:
      'Carga una imagen en Supabase, registra sus datos y genera automáticamente su embedding mediante el servicio de visión.',
  })
  @ApiParam({
    name: 'productoId',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
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
            'Imagen JPG, JPEG, PNG o WebP del producto. Tamaño máximo: 10 MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'Imagen registrada y procesada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'No se proporcionó una imagen, el productoId no es válido o el archivo no cumple con las validaciones',
  })
  @ApiNotFoundResponse({
    description:
      'No existe el producto indicado',
  })
  @ApiConflictResponse({
    description:
      'La imagen ya se encuentra registrada en el producto',
  })
  @ApiBadGatewayResponse({
    description:
      'El servicio de visión o el almacenamiento no se encuentra disponible',
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  registrarImagen(
    @Param(
      'productoId',
      ParseIntPipe,
    )
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
  @ApiOperation({
    summary:
      'Listar las imágenes de un producto',
    description:
      'Devuelve las imágenes activas del producto ordenadas, comenzando por la imagen principal.',
  })
  @ApiParam({
    name: 'productoId',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Imágenes del producto obtenidas correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador del producto no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe el producto indicado',
  })
  listarImagenes(
    @Param(
      'productoId',
      ParseIntPipe,
    )
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
  @ApiOperation({
    summary:
      'Reordenar las imágenes de un producto',
    description:
      'Actualiza el orden de todas las imágenes del producto. La imagen con orden 1 será establecida como principal.',
  })
  @ApiParam({
    name: 'productoId',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Imágenes reordenadas correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'La lista contiene imágenes repetidas, órdenes inválidos, imágenes ajenas o no incluye todas las imágenes del producto',
  })
  @ApiNotFoundResponse({
    description:
      'No existe el producto indicado',
  })
  reordenarImagenes(
    @Param(
      'productoId',
      ParseIntPipe,
    )
    productoId: number,
    @Body()
    reordenarImagenesDto:
      ReordenarImagenesDto,
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