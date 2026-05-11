import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { UploadedImageFile } from '../S3/types/uploaded-image-file.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { type AuthUser } from '../common/types/auth.types';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceMemberDto } from './dto/update-space-member.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { SpacesService } from './spaces.service';

@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
    constructor(private spacesService: SpacesService) {}

    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateSpaceDto) {
        return this.spacesService.create(user.id, dto);
    }

    @Get()
    findMine(
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug?: string
    ) {
        return this.spacesService.findMine(user.id, organizationSlug);
    }

    @Get(':key')
    findOne(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug: string
    ) {
        return this.spacesService.findOne(key, user.id, organizationSlug);
    }

    @Patch(':key')
    update(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug: string,
        @Body() dto: UpdateSpaceDto
    ) {
        return this.spacesService.update(key, user.id, dto, organizationSlug);
    }

    @Post(':key/avatar')
    @UseInterceptors(
        FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })
    )
    uploadAvatar(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug: string,
        @UploadedFile() file: UploadedImageFile
    ) {
        return this.spacesService.updateAvatar(
            key,
            user.id,
            organizationSlug,
            file
        );
    }

    @Delete(':key/avatar')
    removeAvatar(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug: string
    ) {
        return this.spacesService.removeAvatar(key, user.id, organizationSlug);
    }

    @Delete(':key')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Query('organizationSlug') organizationSlug: string
    ) {
        return this.spacesService.remove(key, user.id, organizationSlug);
    }

    @Post(':key/members')
    addMember(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: AddMemberDto
    ) {
        return this.spacesService.addMember(key, user.id, dto);
    }

    @Delete(':key/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeMember(
        @Param('key') key: string,
        @Param('userId') targetUserId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.spacesService.removeMember(key, user.id, targetUserId);
    }

    @Patch(':key/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    updateMember(
        @Param('key') key: string,
        @Param('userId') targetUserId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateSpaceMemberDto
    ) {
        return this.spacesService.updateMember(
            key,
            user.id,
            targetUserId,
            dto
        );
    }
}
