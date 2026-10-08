import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { VisionController } from './vision.controller';
import { VisionService } from './vision.service';

@Module({
  imports: [
    AuthModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ) => ({
        baseURL:
          configService.getOrThrow<string>(
            'VISION_SERVICE_URL',
          ),
        timeout:
          configService.getOrThrow<number>(
            'VISION_SERVICE_TIMEOUT_MS',
          ),
      }),
    }),
  ],
  controllers: [VisionController],
  providers: [VisionService],
  exports: [VisionService],
})
export class VisionModule {}