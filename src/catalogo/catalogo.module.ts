import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductoImagenesModule } from '../producto-imagenes/producto-imagenes.module';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { BusquedaVisualThrottlerGuard } from './guards/busqueda-visual-throttler.guard';

@Module({
  imports: [
    ProductoImagenesModule,
    ThrottlerModule.forRoot([
      {
        name: 'busquedaVisual',
        ttl: 60_000,
        limit: 10,
      },
    ]),
  ],
  controllers: [
    CatalogoController,
  ],
  providers: [
    CatalogoService,
    BusquedaVisualThrottlerGuard,
  ],
  exports: [
    CatalogoService,
  ],
})
export class CatalogoModule {}