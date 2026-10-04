import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { TiendasModule } from './tiendas/tiendas.module';
import { HealthModule } from './health/health.module';
import { envValidationSchema } from './shared/config/env.validation';
import { AuthModule } from './auth/auth.module';
import { VisionModule } from './vision/vision.module';
import { ProductoImagenesModule } from './producto-imagenes/producto-imagenes.module';
import { CatalogoModule } from './catalogo/catalogo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        libraryOptions: {
          abortEarly: false,
        },
      },
    }),
    PrismaModule,
    ProductosModule,
    TiendasModule,
    HealthModule,
    AuthModule,
    VisionModule,
    ProductoImagenesModule,
    CatalogoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}