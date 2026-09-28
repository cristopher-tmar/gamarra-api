import { Module } from '@nestjs/common';
import { VisionModule } from '../vision/vision.module';
import { ProductoImagenesService } from './producto-imagenes.service';
import { ProductoImagenesController } from './producto-imagenes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    VisionModule,
  ],
  providers: [ProductoImagenesService],
  exports: [ProductoImagenesService],
  controllers: [ProductoImagenesController],
})
export class ProductoImagenesModule { }