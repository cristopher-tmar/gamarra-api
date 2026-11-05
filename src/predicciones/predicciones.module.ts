import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../prisma/prisma.module';
import {
  PrediccionesService,
} from './predicciones.service';

@Module({
  imports: [
    PrismaModule,
  ],
  providers: [
    PrediccionesService,
  ],
  exports: [
    PrediccionesService,
  ],
})
export class PrediccionesModule {}