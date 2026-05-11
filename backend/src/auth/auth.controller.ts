import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { UploadedImageFile } from '../S3/types/uploaded-image-file.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthUser } from '../common/types/auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refresh);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getCurrentUser(@CurrentUser() user: AuthUser) {
        return this.authService.getCurrentUser(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateCurrentUser(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateProfileDto
    ) {
        return this.authService.updateCurrentUser(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/avatar')
    @UseInterceptors(
        FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })
    )
    uploadCurrentUserAvatar(
        @CurrentUser() user: AuthUser,
        @UploadedFile() file: UploadedImageFile
    ) {
        return this.authService.updateAvatar(user.id, file);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/avatar')
    async removeCurrentUserAvatar(@CurrentUser() user: AuthUser) {
        return this.authService.removeAvatar(user.id);
    }
}
