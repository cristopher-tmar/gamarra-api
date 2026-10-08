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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
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
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Registra un usuario con rol COMERCIANTE o CLIENTE.',
  })
  @ApiCreatedResponse({
    description:
      'Usuario registrado correctamente',
  })
  @ApiConflictResponse({
    description:
      'Ya existe un usuario registrado con el correo indicado',
  })
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales y devuelve un access token junto con un refresh token.',
  })
  @ApiCreatedResponse({
    description:
      'Inicio de sesión realizado correctamente',
  })
  @ApiUnauthorizedResponse({
    description:
      'Correo electrónico o contraseña incorrectos',
  })
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
  @ApiOperation({
    summary: 'Renovar tokens de autenticación',
    description:
      'Utiliza un refresh token válido para generar una nueva sesión de autenticación.',
  })
  @ApiCreatedResponse({
    description:
      'Tokens renovados correctamente',
  })
  @ApiUnauthorizedResponse({
    description:
      'Refresh token inválido, vencido, revocado o no reconocido',
  })
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
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Revoca el refresh token proporcionado y finaliza la sesión asociada.',
  })
  @ApiCreatedResponse({
    description:
      'Sesión cerrada correctamente',
  })
  @ApiUnauthorizedResponse({
    description:
      'El refresh token no es válido o no puede ser utilizado',
  })
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
  @ApiOperation({
    summary: 'Obtener el perfil autenticado',
    description:
      'Devuelve la información contenida en el access token del usuario autenticado.',
  })
  @ApiOkResponse({
    description:
      'Perfil obtenido correctamente',
  })
  @ApiUnauthorizedResponse({
    description:
      'No se proporcionó un access token válido',
  })
  obtenerPerfil(
    @Request()
    request: AuthenticatedRequest,
  ) {
    return {
      mensaje:
        'Perfil obtenido correctamente',
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

    const direccionIp =
      Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor
          ? forwardedFor
              .split(',')[0]
              ?.trim()
          : request.ip;

    return {
      userAgent:
        request.headers['user-agent'],
      direccionIp,
    };
  }
}