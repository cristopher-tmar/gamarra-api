import {
    ConflictException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

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

        const usuario = await this.prisma.usuario.create({
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

    async login(loginDto: LoginDto) {
        const correoNormalizado = loginDto.correo
            .trim()
            .toLowerCase();

        const usuario = await this.prisma.usuario.findUnique({
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

        const accessToken = await this.jwtService.signAsync({
            sub: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
        });

        return {
            mensaje: 'Inicio de sesión correcto',
            accessToken,
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


}