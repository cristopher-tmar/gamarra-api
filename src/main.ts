import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/http/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './shared/http/interceptors/request-logging.interceptor';
import { correlationIdMiddleware } from './shared/http/middleware/correlation-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService =
    app.get(ConfigService);

  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-Id',
    ],
    exposedHeaders: [
      'X-Correlation-Id',
    ],
    credentials: false,
  });

  app.use(correlationIdMiddleware);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new GlobalExceptionFilter(),
  );

  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(),
  );

  const swaggerConfig =
    new DocumentBuilder()
      .setTitle('Gamarra API')
      .setDescription(
        'API REST para la gestión de negocios, productos y búsqueda visual',
      )
      .setVersion('1.0')
      .addTag('productos')
      .addTag('tiendas')
      .addBearerAuth()
      .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'docs',
    app,
    documentFactory,
  );

  const port =
    configService.get<number>('PORT') ??
    3000;

  await app.listen(port);

  console.log(
    `API: http://localhost:${port}/api`,
  );

  console.log(
    `Swagger: http://localhost:${port}/docs`,
  );

  console.log(
    `CORS habilitado para: ${corsOrigins.join(', ')}`,
  );
}

void bootstrap();