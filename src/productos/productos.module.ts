import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductoImagenesModule } from '../producto-imagenes/producto-imagenes.module';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [
    AuthModule,
    ProductoImagenesModule,
  ],
  controllers: [
    ProductosController,
  ],
  providers: [
    ProductosService,
  ],
  exports: [
    ProductosService,
  ],
})
export class ProductosModule {}