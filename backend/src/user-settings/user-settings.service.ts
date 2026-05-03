import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';

@Injectable()
export class UserSettingsService {
    constructor(private prisma: PrismaService) {}

    getCurrent(userId: string) {
        return this.prisma.userSettings
            .upsert({
                where: { userId },
                update: {},
                create: { userId },
            })
            .then((settings) => this.toResponse(settings));
    }

    updateCurrent(userId: string, dto: UpdateUserSettingsDto) {
        return this.prisma.userSettings
            .upsert({
                where: { userId },
                update: dto,
                create: {
                    userId,
                    editorWidth: dto.editorWidth ?? 'COMPACT',
                },
            })
            .then((settings) => this.toResponse(settings));
    }

    private toResponse(settings: {
        editorWidth: 'FULL_WIDTH' | 'COMPACT';
    }): UserSettingsResponseDto {
        return {
            editorWidth: settings.editorWidth,
        };
    }
}
