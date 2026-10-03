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
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService:
      ProductosService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
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

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COMERCIANTE,
  )
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