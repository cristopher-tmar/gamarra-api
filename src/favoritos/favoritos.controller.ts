import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { FavoritosService } from './favoritos.service';

@ApiTags('favoritos')
@ApiBearerAuth()
@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(
    private readonly favoritosService:
      FavoritosService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar los productos favoritos del usuario autenticado',
  })
  @ApiOkResponse({
    description:
      'Favoritos obtenidos correctamente',
  })
  @ApiUnauthorizedResponse({
    description:
      'El usuario no está autenticado',
  })
  listar(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.favoritosService.listar(
      request.usuario.sub,
    );
  }

  @Post(':productoId')
  @ApiOperation({
    summary:
      'Agregar un producto a favoritos',
  })
  @ApiParam({
    name: 'productoId',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiCreatedResponse({
    description:
      'Producto agregado a favoritos',
  })
  @ApiNotFoundResponse({
    description:
      'El producto no existe o no está disponible',
  })
  @ApiUnauthorizedResponse({
    description:
      'El usuario no está autenticado',
  })
  agregar(
    @Req()
    request: AuthenticatedRequest,
    @Param(
      'productoId',
      ParseIntPipe,
    )
    productoId: number,
  ) {
    return this.favoritosService.agregar(
      request.usuario.sub,
      productoId,
    );
  }

  @Delete(':productoId')
  @ApiOperation({
    summary:
      'Eliminar un producto de favoritos',
  })
  @ApiParam({
    name: 'productoId',
    description:
      'Identificador del producto',
    type: Number,
    example: 1,
  })
  @ApiNoContentResponse({
    description:
      'Producto eliminado de favoritos',
  })
  @ApiNotFoundResponse({
    description:
      'El producto no se encuentra en favoritos',
  })
  @ApiUnauthorizedResponse({
    description:
      'El usuario no está autenticado',
  })
  eliminar(
    @Req()
    request: AuthenticatedRequest,
    @Param(
      'productoId',
      ParseIntPipe,
    )
    productoId: number,
  ) {
    return this.favoritosService.eliminar(
      request.usuario.sub,
      productoId,
    );
  }
}