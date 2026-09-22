import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TiendasService } from './tiendas.service';
import { TiendasController } from './tiendas.controller';

@Module({
  imports: [AuthModule],
  controllers: [TiendasController],
  providers: [TiendasService],
})
export class TiendasModule {}
