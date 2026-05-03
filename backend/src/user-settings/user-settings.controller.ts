import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthUser } from '../common/types/auth.types';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';
import { UserSettingsService } from './user-settings.service';

@Controller('user-settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
    constructor(private userSettingsService: UserSettingsService) {}

    @Get('me')
    getCurrent(
        @CurrentUser() user: AuthUser
    ): Promise<UserSettingsResponseDto> {
        return this.userSettingsService.getCurrent(user.id);
    }

    @Patch('me')
    updateCurrent(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateUserSettingsDto
    ): Promise<UserSettingsResponseDto> {
        return this.userSettingsService.updateCurrent(user.id, dto);
    }
}
