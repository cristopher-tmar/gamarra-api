import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateProductosMasivoDto } from './dto/create-productos-masivo.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';

@ApiTags('productos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'No se proporcionó un access token válido',
})
@ApiForbiddenResponse({
  description:
    'El usuario no tiene permisos para realizar esta operación',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COMERCIANTE,
)
@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService:
      ProductosService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un producto',
    description:
      'Registra un producto en una tienda perteneciente al comerciante autenticado. El administrador puede registrar productos en cualquier tienda.',
  })
  @ApiCreatedResponse({
    description:
      'Producto registrado correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Los datos enviados no cumplen con las validaciones requeridas',
  })
  @ApiNotFoundResponse({
    description:
      'No existe la tienda indicada',
  })
  @ApiConflictResponse({
    description:
      'Ya existe un producto con el código indicado',
  })
  create(
    @Body()
    createProductoDto: CreateProductoDto,
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.create(
      createProductoDto,
      request.usuario,
    );
  }

  @Post('masivo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar productos de forma masiva',
    description:
      'Registra una lista de productos (por ejemplo, leída desde un Excel o CSV). Cada producto se valida y registra con las mismas reglas y permisos que POST /productos. ' +
      'El registro es parcial: los productos válidos se guardan y los rechazados se reportan con su fila, código y motivos.',
  })
  @ApiOkResponse({
    description:
      'Lote procesado. Devuelve totalRecibidos, registrados, rechazados, productosRegistrados y errores.',
  })
  @ApiBadRequestResponse({
    description:
      'El cuerpo no contiene una lista válida de productos',
  })
  createMany(
    @Body()
    createProductosMasivoDto: CreateProductosMasivoDto,
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.createMany(
      createProductosMasivoDto,
      request.usuario,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar productos administrables',
    description:
      'El comerciante obtiene los productos pertenecientes a sus tiendas. El administrador obtiene todos los productos.',
  })
  @ApiOkResponse({
    description:
      'Productos obtenidos correctamente',
  })
  findAll(
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.findAll(
      request.usuario,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Obtener un producto administrable',
    description:
      'Devuelve un producto cuando pertenece a una tienda del comerciante autenticado o cuando el usuario es administrador.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Producto obtenido correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador del producto no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe un producto con el identificador indicado',
  })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.findOne(
      id,
      request.usuario,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un producto',
    description:
      'Actualiza parcialmente un producto perteneciente a una tienda del comerciante autenticado. El administrador puede actualizar cualquier producto.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Producto actualizado correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o los datos enviados no son válidos',
  })
  @ApiNotFoundResponse({
    description:
      'No existe el producto o la nueva tienda indicada',
  })
  @ApiConflictResponse({
    description:
      'El nuevo código ya está siendo utilizado por otro producto',
  })
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateProductoDto: UpdateProductoDto,
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.update(
      id,
      updateProductoDto,
      request.usuario,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un producto',
    description:
      'Elimina el producto, sus registros de imágenes y embeddings. También intenta eliminar los archivos asociados de Supabase.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Producto eliminado correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador del producto no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe un producto con el identificador indicado',
  })
  remove(
    @Param('id', ParseIntPipe)
    id: number,
    @Request()
    request: AuthenticatedRequest,
  ) {
    return this.productosService.remove(
      id,
      request.usuario,
    );
  }
}