import { Module } from '@nestjs/common';
import { VisionModule } from '../vision/vision.module';
import { ProductoImagenesService } from './producto-imagenes.service';
import { ProductoImagenesController } from './producto-imagenes.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseImageStorage } from './infrastructure/supabase-image-storage';
import { ImageStorage } from './interfaces/image-storage.interface';
import { ProductoImagenesUploadController } from './producto-imagenes-upload.controller';
@Module({
  imports: [
    AuthModule,
    VisionModule,
  ],
  providers: [
    ProductoImagenesService,
    {
      provide: ImageStorage,
      useClass: SupabaseImageStorage,
    },
  ],
  exports: [ProductoImagenesService],
  controllers: [
    ProductoImagenesController,
    ProductoImagenesUploadController
  ],
})
export class ProductoImagenesModule { }