import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtPayload {
  sub: number;
  correo: string;
  rol: string;
}

export interface AuthenticatedRequest extends Request {
  usuario: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'No se proporcionó un token de autenticación',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
        );

      request.usuario = payload;

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

    if (tipo !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
}