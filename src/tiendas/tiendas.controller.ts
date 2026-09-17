import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { TiendasService } from './tiendas.service';

@Controller('tiendas')
export class TiendasController {
  constructor(
    private readonly tiendasService: TiendasService,
  ) {}

  @Post()
  create(@Body() createTiendaDto: CreateTiendaDto) {
    return this.tiendasService.create(createTiendaDto);
  }

  @Get()
  findAll() {
    return this.tiendasService.findAll();
  }

  @Get(':id/productos')
  findProductos(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tiendasService.findProductos(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTiendaDto: UpdateTiendaDto,
  ) {
    return this.tiendasService.update(
      id,
      updateTiendaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasService.remove(id);
  }
}