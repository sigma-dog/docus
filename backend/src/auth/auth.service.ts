import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import sharp from 'sharp';

import type { UploadedImageFile } from '../S3/types/uploaded-image-file.type';
import { MAX_AVATAR_IMAGE_SIZE_BYTES } from '../common/constants/files.constants';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../S3/S3.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface JwtPayload {
    sub: string;
    email: string;
}

const currentUserSelect = {
    id: true,
    username: true,
    email: true,
    avatarUrl: true,
} as const;

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
        private readonly s3Service: S3Service
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

    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: currentUserSelect,
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateCurrentUser(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                avatarUrl: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const data: {
            username?: string;
            email?: string;
            avatarUrl?: string | null;
        } = {};

        if (dto.username !== undefined) {
            data.username = dto.username.trim();
        }

        if (dto.email !== undefined) {
            data.email = dto.email.trim().toLowerCase();
        }

        if (data.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: data.email },
                select: { id: true },
            });

            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('Email already in use');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: currentUserSelect,
        });

        return updatedUser;
    }

    async removeAvatar(userId: string) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                avatarUrl: true,
            },
        });

        if (!currentUser) {
            throw new NotFoundException(
                `Пользователь с id ${userId} не существует`
            );
        }

        if (currentUser?.avatarUrl) {
            const oldAvatarFileKey = this.s3Service.parseFileKeyFromUrl(
                currentUser.avatarUrl
            );

            this.s3Service.removeFile(oldAvatarFileKey).catch(console.error);
        }

        return await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: null },
            select: currentUserSelect,
        });
    }

    async updateAvatar(userId: string, file: UploadedImageFile) {
        if (!file) {
            throw new BadRequestException('Файл не предоставлен');
        }

        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Можно загружать только изображения');
        }

        // Ограничение размера (например, 5MB)
        if (file.size > MAX_AVATAR_IMAGE_SIZE_BYTES) {
            throw new BadRequestException(
                'Размер файла не должен превышать 5MB'
            );
        }

        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                avatarUrl: true,
            },
        });

        if (!currentUser) {
            throw new NotFoundException(
                `Пользователь с id ${userId} не существует`
            );
        }

        const compressedImageBuffer = await sharp(file.buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
            .webp({
                quality: 80,
                effort: 4,
                alphaQuality: 80,
            })
            .toBuffer();

        const fileKey = `avatars/${userId}/${Date.now()}.webp`;

        const avatarUrl = await this.s3Service.uploadFile({
            fileKey,
            buffer: compressedImageBuffer,
            contentType: 'image/webp',
        });

        // Удаляем старую аватарку из S3 (если она была)
        if (currentUser?.avatarUrl) {
            const oldAvatarFileKey = this.s3Service.parseFileKeyFromUrl(
                currentUser.avatarUrl
            );

            this.s3Service.removeFile(oldAvatarFileKey).catch(console.error);
        }

        return await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: currentUserSelect,
        });
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
