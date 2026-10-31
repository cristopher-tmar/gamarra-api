import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from '../auth/auth.module';
import {
  PrismaModule,
} from '../prisma/prisma.module';
import {
  EventosComportamientoController,
} from './eventos-comportamiento.controller';
import {
  EventosComportamientoService,
} from './eventos-comportamiento.service';
import {
  OptionalJwtAuthGuard,
} from '../auth/guards/optional-jwt-auth.guard';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  controllers: [
    EventosComportamientoController,
  ],
  providers: [
    EventosComportamientoService,
    OptionalJwtAuthGuard,
  ],
})
export class EventosComportamientoModule {}