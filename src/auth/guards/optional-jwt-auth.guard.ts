import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  JwtService,
} from '@nestjs/jwt';
import type {
  Request,
} from 'express';

import type {
  JwtPayload,
} from './jwt-auth.guard';

export interface OptionalAuthenticatedRequest
  extends Request {
  usuario?: JwtPayload;
}

@Injectable()
export class OptionalJwtAuthGuard
  implements CanActivate {
  constructor(
    private readonly jwtService:
      JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp()
        .getRequest<OptionalAuthenticatedRequest>();

    const token =
      this.extraerToken(request);

    if (!token) {
      return true;
    }

    try {
      request.usuario =
        await this.jwtService
          .verifyAsync<JwtPayload>(
            token,
          );

      return true;
    } catch {
      throw new UnauthorizedException(
        'El token de autenticación no es válido o ha expirado',
      );
    }
  }

  private extraerToken(
    request: Request,
  ): string | undefined {
    const authorization =
      request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [tipo, token] =
      authorization.split(' ');

    if (
      tipo !== 'Bearer' ||
      !token
    ) {
      return undefined;
    }

    return token;
  }
}