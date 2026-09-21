import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

interface ErrorResponse {
  codigo: string;
  mensaje: string;
  errores: string[];
  statusCode: number;
  metodo: string;
  ruta: string;
  fecha: string;
  correlationId: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const request = context.getRequest<RequestWithCorrelationId>();
    const response = context.getResponse<Response>();

    const statusCode = this.obtenerStatusCode(exception);
    const errores = this.obtenerErrores(exception);
    const mensaje = this.obtenerMensajeGeneral(
      exception,
      statusCode,
      errores,
    );

    const correlationId = request.correlationId ?? 'no-disponible';

    const respuesta: ErrorResponse = {
      codigo: this.obtenerCodigo(statusCode),
      mensaje,
      errores,
      statusCode,
      metodo: request.method,
      ruta: request.originalUrl,
      fecha: new Date().toISOString(),
      correlationId
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.originalUrl} ${statusCode}`,
      );
    }

    response.status(statusCode).json(respuesta);
  }

  private obtenerStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private obtenerErrores(exception: unknown): string[] {
    if (!(exception instanceof HttpException)) {
      return [];
    }

    const response =
      exception.getResponse() as string | HttpExceptionResponse;

    if (typeof response === 'string') {
      return [];
    }

    if (Array.isArray(response.message)) {
      return response.message;
    }

    return [];
  }

  private obtenerMensajeGeneral(
    exception: unknown,
    statusCode: number,
    errores: string[],
  ): string {
    if (errores.length > 0) {
      return 'La solicitud contiene datos inválidos';
    }

    if (exception instanceof HttpException) {
      const response =
        exception.getResponse() as string | HttpExceptionResponse;

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response.message === 'string') {
        return response.message;
      }
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Ocurrió un error interno en el servidor';
    }

    return 'No se pudo procesar la solicitud';
  }

  private obtenerCodigo(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'DATOS_INVALIDOS';

    case HttpStatus.UNAUTHORIZED:
      return 'NO_AUTENTICADO';

    case HttpStatus.FORBIDDEN:
      return 'ACCESO_DENEGADO';

    case HttpStatus.NOT_FOUND:
      return 'RECURSO_NO_ENCONTRADO';

    case HttpStatus.CONFLICT:
      return 'CONFLICTO';

    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'ENTIDAD_NO_PROCESABLE';

    case HttpStatus.TOO_MANY_REQUESTS:
      return 'DEMASIADAS_SOLICITUDES';

    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'ERROR_INTERNO';

    case HttpStatus.BAD_GATEWAY:
      return 'SERVICIO_EXTERNO_NO_DISPONIBLE';

    case HttpStatus.GATEWAY_TIMEOUT:
      return 'TIEMPO_DE_ESPERA_AGOTADO';

    default:
      return 'ERROR_NO_CONTROLADO';
  }
}
}
