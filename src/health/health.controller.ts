import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { VisionService } from '../vision/vision.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visionService: VisionService,
  ) {}

  @Get()
  async check() {
    const inicio = Date.now();

    let baseDatosDisponible = false;
    let tiempoBaseDatosMs = 0;

    const inicioBaseDatos = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDatosDisponible = true;
    } catch {
      baseDatosDisponible = false;
    } finally {
      tiempoBaseDatosMs =
        Date.now() - inicioBaseDatos;
    }

    const vision =
      await this.visionService.verificarSalud();

    const disponible =
      baseDatosDisponible &&
      vision.disponible;

    const respuesta = {
      estado: disponible
        ? 'OK'
        : 'DEGRADADO',
      servicio: 'gamarra-api',
      disponible,
      componentes: {
        baseDatos: {
          disponible: baseDatosDisponible,
          tiempoRespuestaMs:
            tiempoBaseDatosMs,
        },
        vision: {
          disponible: vision.disponible,
          tiempoRespuestaMs:
            vision.tiempoRespuestaMs,
        },
      },
      tiempoRespuestaMs:
        Date.now() - inicio,
      fecha: new Date().toISOString(),
    };

    if (!disponible) {
      throw new ServiceUnavailableException(
        respuesta,
      );
    }

    return respuesta;
  }
}