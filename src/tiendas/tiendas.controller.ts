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
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

@Controller('tiendas')
export class TiendasController {
  constructor(
    private readonly tiendasService: TiendasService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  findAll() {
    return this.tiendasService.findAll();
  }

  @Get(':id/productos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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