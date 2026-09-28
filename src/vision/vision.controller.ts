import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestWithCorrelationId } from '../shared/http/middleware/correlation-id.middleware';
import { VisionService } from './vision.service';

interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@ApiTags('vision')
@Controller('vision')
export class VisionController {
  constructor(
    private readonly visionService: VisionService,
  ) {}

  @Post('generar-embedding')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['archivo'],
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen JPG, JPEG, PNG o WebP',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  generarEmbedding(
    @UploadedFile() archivo: UploadedImage,
    @Req() request: RequestWithCorrelationId,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debe proporcionar una imagen',
      );
    }

    return this.visionService.generarEmbedding(
      archivo,
      request.correlationId,
    );
  }
}