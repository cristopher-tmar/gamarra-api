import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VisionModule } from '../vision/vision.module';
import { SupabaseImageStorage } from './infrastructure/supabase-image-storage';
import { ImageStorage } from './interfaces/image-storage.interface';
import { ProductoImagenesController } from './producto-imagenes.controller';
import { ProductoImagenesUploadController } from './producto-imagenes-upload.controller';
import { ProductoImagenesService } from './producto-imagenes.service';

@Module({
  imports: [
    AuthModule,
    VisionModule,
  ],
  controllers: [
    ProductoImagenesController,
    ProductoImagenesUploadController,
  ],
  providers: [
    ProductoImagenesService,
    {
      provide: ImageStorage,
      useClass: SupabaseImageStorage,
    },
  ],
  exports: [
    ProductoImagenesService,
    ImageStorage,
  ],
})
export class ProductoImagenesModule {}