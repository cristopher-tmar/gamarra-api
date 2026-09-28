import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VisionService } from './vision.service';
import { VisionController } from './vision.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
  providers: [VisionService],
  exports: [VisionService],
  controllers: [VisionController],
})
export class VisionModule {}