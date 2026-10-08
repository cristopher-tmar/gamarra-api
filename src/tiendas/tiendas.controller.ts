import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { TiendasService } from './tiendas.service';
import { RolUsuario } from '../generated/prisma/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

@ApiTags('tiendas')
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
@Controller('tiendas')
export class TiendasController {
  constructor(
    private readonly tiendasService: TiendasService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Registrar una tienda',
    description:
      'Registra una tienda asociada al usuario autenticado.',
  })
  @ApiCreatedResponse({
    description:
      'Tienda registrada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Los datos enviados no cumplen con las validaciones requeridas',
  })
  @ApiConflictResponse({
    description:
      'Ya existe una tienda con el código indicado',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  create(
    @Body() createTiendaDto: CreateTiendaDto,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.create(
      createTiendaDto,
      request.usuario.sub,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las tiendas',
    description:
      'Devuelve todas las tiendas registradas. Esta operación está disponible únicamente para administradores.',
  })
  @ApiOkResponse({
    description:
      'Tiendas obtenidas correctamente',
  })
  @Roles(RolUsuario.ADMINISTRADOR)
  findAll() {
    return this.tiendasService.findAll();
  }

  @Get(':id/productos')
  @ApiOperation({
    summary: 'Listar productos de una tienda',
    description:
      'Devuelve los productos de la tienda cuando pertenece al comerciante autenticado o cuando el usuario es administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Productos de la tienda obtenidos correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador de la tienda no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe una tienda con el identificador indicado',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  findProductos(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.findProductosAuthorized(
      id,
      request.usuario,
    );
  }

  @Get('mis-tiendas')
  @ApiOperation({
    summary: 'Listar mis tiendas',
    description:
      'Devuelve las tiendas pertenecientes al comerciante autenticado. El administrador puede consultar todas las tiendas disponibles según la lógica del servicio.',
  })
  @ApiOkResponse({
    description:
      'Tiendas del usuario obtenidas correctamente',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  findMyStores(
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.findMyStores(
      request.usuario,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tienda',
    description:
      'Devuelve la tienda cuando pertenece al comerciante autenticado o cuando el usuario es administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Tienda obtenida correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador de la tienda no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe una tienda con el identificador indicado',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.findOneAuthorized(
      id,
      request.usuario,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una tienda',
    description:
      'Actualiza parcialmente una tienda perteneciente al comerciante autenticado. El administrador puede actualizar cualquier tienda.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Tienda actualizada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o los datos enviados no son válidos',
  })
  @ApiNotFoundResponse({
    description:
      'No existe una tienda con el identificador indicado',
  })
  @ApiConflictResponse({
    description:
      'El nuevo código ya está siendo utilizado por otra tienda',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTiendaDto: UpdateTiendaDto,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.update(
      id,
      updateTiendaDto,
      request.usuario,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una tienda',
    description:
      'Elimina una tienda perteneciente al comerciante autenticado. El administrador puede eliminar cualquier tienda.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Tienda eliminada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'El identificador de la tienda no es válido',
  })
  @ApiNotFoundResponse({
    description:
      'No existe una tienda con el identificador indicado',
  })
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.tiendasService.remove(
      id,
      request.usuario,
    );
  }
}