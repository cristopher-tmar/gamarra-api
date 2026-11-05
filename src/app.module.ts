import {
  Module,
} from '@nestjs/common';
import {
  ConfigModule,
} from '@nestjs/config';

import {
  AppController,
} from './app.controller';
import {
  AppService,
} from './app.service';
import {
  AuthModule,
} from './auth/auth.module';
import {
  CatalogoModule,
} from './catalogo/catalogo.module';
import {
  EventosComportamientoModule,
} from './eventos-comportamiento/eventos-comportamiento.module';
import {
  FavoritosModule,
} from './favoritos/favoritos.module';
import {
  HealthModule,
} from './health/health.module';
import {
  PrismaModule,
} from './prisma/prisma.module';
import {
  ProductoImagenesModule,
} from './producto-imagenes/producto-imagenes.module';
import {
  ProductosModule,
} from './productos/productos.module';
import {
  envValidationSchema,
} from './shared/config/env.validation';
import {
  TiendasModule,
} from './tiendas/tiendas.module';
import {
  VisionModule,
} from './vision/vision.module';
import {
  PrediccionesModule,
} from './predicciones/predicciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema:
        envValidationSchema,
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
    FavoritosModule,
    EventosComportamientoModule,
    PrediccionesModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}