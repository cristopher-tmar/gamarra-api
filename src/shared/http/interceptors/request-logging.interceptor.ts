import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(
    RequestLoggingInterceptor.name,
  );

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const httpContext = context.switchToHttp();

    const request =
      httpContext.getRequest<RequestWithCorrelationId>();

    const response = httpContext.getResponse<Response>();

    const tiempoInicio = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const duracionMs = Date.now() - tiempoInicio;

        const correlationId =
          request.correlationId ?? 'no-disponible';

        this.logger.log(
          `[${correlationId}] ${request.method} ${request.originalUrl} ${response.statusCode} ${duracionMs}ms`,
        );
      }),
    );
  }
}