import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../prisma/prisma.module';
import {
  PrediccionesController,
} from './predicciones.controller';
import {
  PrediccionesService,
} from './predicciones.service';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    PrediccionesController,
  ],
  providers: [
    PrediccionesService,
  ],
  exports: [
    PrediccionesService,
  ],
})
export class PrediccionesModule {}