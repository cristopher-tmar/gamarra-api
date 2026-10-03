import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import ms, { type StringValue } from 'ms';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './guards/jwt-auth.guard';

interface RefreshTokenPayload extends JwtPayload {
  sesionId: string;
  tipo: 'refresh';
}

interface DatosSesion {
  userAgent?: string;
  direccionIp?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const correoNormalizado = registerDto.correo
      .trim()
      .toLowerCase();

    const usuarioExistente =
      await this.prisma.usuario.findUnique({
        where: {
          correo: correoNormalizado,
        },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo electrónico',
      );
    }

    const passwordHash = await argon2.hash(
      registerDto.password,
    );

    const usuario =
      await this.prisma.usuario.create({
        data: {
          nombres: registerDto.nombres.trim(),
          apellidos: registerDto.apellidos.trim(),
          correo: correoNormalizado,
          passwordHash,
          rol: registerDto.rol,
        },
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          correo: true,
          rol: true,
          estado: true,
          fechaCreacion: true,
        },
      });

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario,
    };
  }

  async login(
    loginDto: LoginDto,
    datosSesion: DatosSesion = {},
  ) {
    const correoNormalizado = loginDto.correo
      .trim()
      .toLowerCase();

    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          correo: correoNormalizado,
        },
      });

    if (!usuario) {
      throw new UnauthorizedException(
        'El correo electrónico o la contraseña son incorrectos',
      );
    }

    const passwordValido = await argon2.verify(
      usuario.passwordHash,
      loginDto.password,
    );

    if (!passwordValido) {
      throw new UnauthorizedException(
        'El correo electrónico o la contraseña son incorrectos',
      );
    }

    if (!usuario.estado) {
      throw new UnauthorizedException(
        'El usuario se encuentra inactivo',
      );
    }

    const tokens = await this.crearSesion(
      {
        sub: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      datosSesion,
    );

    return {
      mensaje: 'Inicio de sesión correcto',
      ...tokens,
      tipoToken: 'Bearer',
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  async refresh(
    refreshToken: string,
    datosSesion: DatosSesion = {},
  ) {
    const payload =
      await this.verificarRefreshToken(
        refreshToken,
      );

    const sesion =
      await this.prisma.sesionRefresh.findUnique({
        where: {
          id: payload.sesionId,
        },
        include: {
          usuario: true,
        },
      });

    if (!sesion) {
      throw new UnauthorizedException(
        'La sesión de renovación no existe',
      );
    }

    if (sesion.fechaRevocacion) {
      throw new UnauthorizedException(
        'La sesión de renovación fue revocada',
      );
    }

    if (sesion.fechaExpiracion <= new Date()) {
      throw new UnauthorizedException(
        'La sesión de renovación ha expirado',
      );
    }

    const tokenValido = await argon2.verify(
      sesion.tokenHash,
      refreshToken,
    );

    if (!tokenValido) {
      throw new UnauthorizedException(
        'El refresh token no es válido',
      );
    }

    if (!sesion.usuario.estado) {
      throw new UnauthorizedException(
        'El usuario se encuentra inactivo',
      );
    }

    /*
     * El refresh token anterior se revoca antes de
     * generar una sesión nueva.
     *
     * De esta manera, cada refresh token puede
     * utilizarse una sola vez.
     */
    const sesionRevocada =
      await this.prisma.sesionRefresh.updateMany({
        where: {
          id: sesion.id,
          fechaRevocacion: null,
        },
        data: {
          fechaRevocacion: new Date(),
        },
      });

    if (sesionRevocada.count !== 1) {
      throw new UnauthorizedException(
        'La sesión ya fue utilizada o revocada',
      );
    }

    const tokens = await this.crearSesion(
      {
        sub: sesion.usuario.id,
        correo: sesion.usuario.correo,
        rol: sesion.usuario.rol,
      },
      datosSesion,
    );

    return {
      mensaje: 'Tokens renovados correctamente',
      ...tokens,
      tipoToken: 'Bearer',
    };
  }

  async logout(refreshToken: string) {
    const payload =
      await this.verificarRefreshToken(
        refreshToken,
      );

    const sesion =
      await this.prisma.sesionRefresh.findUnique({
        where: {
          id: payload.sesionId,
        },
      });

    /*
     * Si la sesión ya no existe, consideramos
     * que el cierre de sesión fue exitoso.
     */
    if (!sesion) {
      return {
        mensaje: 'Sesión cerrada correctamente',
      };
    }

    /*
     * Si ya fue revocada, no necesitamos
     * volver a modificarla.
     */
    if (sesion.fechaRevocacion) {
      return {
        mensaje: 'Sesión cerrada correctamente',
      };
    }

    const tokenValido = await argon2.verify(
      sesion.tokenHash,
      refreshToken,
    );

    if (!tokenValido) {
      throw new UnauthorizedException(
        'El refresh token no es válido',
      );
    }

    await this.prisma.sesionRefresh.update({
      where: {
        id: sesion.id,
      },
      data: {
        fechaRevocacion: new Date(),
      },
    });

    return {
      mensaje: 'Sesión cerrada correctamente',
    };
  }

  private async crearSesion(
    usuario: JwtPayload,
    datosSesion: DatosSesion,
  ) {
    const sesionId = randomUUID();

    const accessToken =
      await this.jwtService.signAsync({
        sub: usuario.sub,
        correo: usuario.correo,
        rol: usuario.rol,
        tipo: 'access',
      });

    const refreshExpiresIn =
      this.configService.getOrThrow<StringValue>(
        'JWT_REFRESH_EXPIRES_IN',
      );

    const refreshToken =
      await this.jwtService.signAsync(
        {
          sub: usuario.sub,
          correo: usuario.correo,
          rol: usuario.rol,
          sesionId,
          tipo: 'refresh',
        } satisfies RefreshTokenPayload,
        {
          secret:
            this.configService.getOrThrow<string>(
              'JWT_REFRESH_SECRET',
            ),
          expiresIn: refreshExpiresIn,
        },
      );

    const tokenHash = await argon2.hash(
      refreshToken,
    );

    const duracionRefresh = ms(
      refreshExpiresIn,
    );

    const fechaExpiracion = new Date(
      Date.now() + duracionRefresh,
    );

    await this.prisma.sesionRefresh.create({
      data: {
        id: sesionId,
        usuarioId: usuario.sub,
        tokenHash,
        fechaExpiracion,
        userAgent:
          datosSesion.userAgent?.substring(
            0,
            500,
          ),
        direccionIp:
          datosSesion.direccionIp?.substring(
            0,
            64,
          ),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn:
        this.configService.getOrThrow<string>(
          'JWT_EXPIRES_IN',
        ),
      refreshTokenExpiresIn:
        refreshExpiresIn,
    };
  }

  private async verificarRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret:
              this.configService.getOrThrow<string>(
                'JWT_REFRESH_SECRET',
              ),
          },
        );

      if (
        payload.tipo !== 'refresh' ||
        !payload.sesionId
      ) {
        throw new UnauthorizedException(
          'El token proporcionado no es un refresh token',
        );
      }

      return payload;
    } catch (error: unknown) {
      if (
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        'El refresh token no es válido o ha expirado',
      );
    }
  }
}