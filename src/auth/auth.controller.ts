import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('registro')
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(
    @Body()
    loginDto: LoginDto,
    @Request()
    request: ExpressRequest,
  ) {
    return this.authService.login(
      loginDto,
      this.obtenerDatosSesion(request),
    );
  }

  @Post('refresh')
  refresh(
    @Body()
    refreshTokenDto: RefreshTokenDto,
    @Request()
    request: ExpressRequest,
  ) {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
      this.obtenerDatosSesion(request),
    );
  }

  @Post('logout')
  logout(
    @Body()
    refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.logout(
      refreshTokenDto.refreshToken,
    );
  }

  @Get('perfil')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  obtenerPerfil(
    @Request()
    request: AuthenticatedRequest,
  ) {
    return {
      mensaje: 'Perfil obtenido correctamente',
      usuario: request.usuario,
    };
  }

  private obtenerDatosSesion(
    request: ExpressRequest,
  ): {
    userAgent?: string;
    direccionIp?: string;
  } {
    const forwardedFor =
      request.headers['x-forwarded-for'];

    const direccionIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor
        ? forwardedFor.split(',')[0]?.trim()
        : request.ip;

    return {
      userAgent:
        request.headers['user-agent'],
      direccionIp,
    };
  }
}