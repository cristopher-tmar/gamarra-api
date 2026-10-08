import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import type { VisionEmbeddingResponse } from './interfaces/embedding-response.interface';

interface VisionErrorResponse {
  mensaje?: string;
  codigo?: string;
}

export interface VisionHealthResult {
  disponible: boolean;
  tiempoRespuestaMs: number;
}

@Injectable()
export class VisionService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async verificarSalud(): Promise<VisionHealthResult> {
    const inicio = Date.now();

    try {
      await firstValueFrom(
        this.httpService.get('/health'),
      );

      return {
        disponible: true,
        tiempoRespuestaMs: Date.now() - inicio,
      };
    } catch {
      return {
        disponible: false,
        tiempoRespuestaMs: Date.now() - inicio,
      };
    }
  }

  async generarEmbedding(
    archivo: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    correlationId: string,
  ): Promise<VisionEmbeddingResponse> {
    const formulario = new FormData();

    formulario.append(
      'archivo',
      archivo.buffer,
      {
        filename: archivo.originalname,
        contentType: archivo.mimetype,
      },
    );

    try {
      const respuesta = await firstValueFrom(
        this.httpService.post<VisionEmbeddingResponse>(
          '/vision/embeddings',
          formulario,
          {
            headers: {
              ...formulario.getHeaders(),
              'x-correlation-id': correlationId,
            },
          },
        ),
      );

      return respuesta.data;
    } catch (error: unknown) {
      this.manejarErrorVision(error);
    }
  }

  private manejarErrorVision(
    error: unknown,
  ): never {
    if (!(error instanceof AxiosError)) {
      throw new BadGatewayException(
        'No se pudo procesar la imagen en el servicio de visión',
      );
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      throw new GatewayTimeoutException(
        'El servicio de visión excedió el tiempo máximo de respuesta',
      );
    }

    if (!error.response) {
      throw new BadGatewayException(
        'El servicio de visión no se encuentra disponible',
      );
    }

    const respuestaVision =
      error.response.data as VisionErrorResponse;

    throw new BadGatewayException(
      respuestaVision?.mensaje ??
        'El servicio de visión no pudo procesar la imagen',
    );
  }
}