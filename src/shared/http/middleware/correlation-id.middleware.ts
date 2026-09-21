import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export interface RequestWithCorrelationId extends Request {
  correlationId: string;
}

export function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const correlationIdRecibido = request.header(
    CORRELATION_ID_HEADER,
  );

  const correlationId =
    correlationIdRecibido?.trim() || randomUUID();

  const requestConCorrelationId =
    request as RequestWithCorrelationId;

  requestConCorrelationId.correlationId = correlationId;

  response.setHeader(
    CORRELATION_ID_HEADER,
    correlationId,
  );

  next();
}