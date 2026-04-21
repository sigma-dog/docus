import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hashed,
            },
        });

        return this.buildAuthResponse(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) throw new NotFoundException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new NotFoundException('Invalid credentials');

        return this.buildAuthResponse(user);
    }

    async refresh(refreshToken: string) {
        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(
                refreshToken,
                {
                    secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                }
            );
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || user.refreshToken !== refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokens = await this.issueTokens({
            sub: user.id,
            email: user.email,
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refresh },
        });
        return tokens;
    }

    private async buildAuthResponse(user: {
        id: string;
        username: string;
        email: string;
        avatarUrl: string | null;
    }) {
        const tokens = await this.issueTokens({
            sub: user.id,
            email: user.email,
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refresh },
        });

        return {
            ...tokens,
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
        };
    }

    private async issueTokens(payload: JwtPayload) {
        const [access, refresh] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
            }),
        ]);
        return { access, refresh };
    }
}
