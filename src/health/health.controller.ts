import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async check() {
    const inicio = Date.now();

    await this.prisma.$queryRaw`SELECT 1`;

    return {
      estado: 'OK',
      servicio: 'gamarra-api',
      baseDatos: 'CONECTADA',
      tiempoRespuestaMs: Date.now() - inicio,
      fecha: new Date().toISOString(),
    };
  }
}