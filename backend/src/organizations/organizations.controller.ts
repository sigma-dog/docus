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
import { AddOrgMemberDto } from './dto/add-org-member.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrgMemberRoleDto } from './dto/update-org-member-role.dto';
import { OrganizationsService } from './organizations.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
    constructor(private organizationsService: OrganizationsService) {}

    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrganizationDto) {
        return this.organizationsService.create(user.id, dto);
    }

    @Get()
    findMine(@CurrentUser() user: AuthUser) {
        return this.organizationsService.findMine(user.id);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
        return this.organizationsService.findOne(slug, user.id);
    }

    @Patch(':slug')
    update(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateOrganizationDto
    ) {
        return this.organizationsService.update(slug, user.id, dto);
    }

    @Post(':slug/avatar')
    @UseInterceptors(
        FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })
    )
    uploadAvatar(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @UploadedFile() file: UploadedImageFile
    ) {
        return this.organizationsService.updateAvatar(slug, user.id, file);
    }

    @Delete(':slug/avatar')
    removeAvatar(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
        return this.organizationsService.removeAvatar(slug, user.id);
    }

    @Delete(':slug')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
        return this.organizationsService.remove(slug, user.id);
    }

    @Post(':slug/members')
    addMember(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: AddOrgMemberDto
    ) {
        return this.organizationsService.addMember(slug, user.id, dto);
    }

    @Delete(':slug/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeMember(
        @Param('slug') slug: string,
        @Param('userId') targetUserId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.organizationsService.removeMember(
            slug,
            user.id,
            targetUserId
        );
    }

    @Patch(':slug/members/:userId')
    updateMemberRole(
        @Param('slug') slug: string,
        @Param('userId') targetUserId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateOrgMemberRoleDto
    ) {
        return this.organizationsService.updateMemberRole(
            slug,
            user.id,
            targetUserId,
            dto.role
        );
    }

    @Get(':slug/pages/search')
    searchPages(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @Query('q') q: string
    ) {
        return this.organizationsService.searchPages(slug, user.id, q);
    }

    @Get(':slug/spaces')
    findSpaces(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
        return this.organizationsService.findSpaces(slug, user.id);
    }

    @Post(':slug/invites')
    createInvite(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateInviteDto
    ) {
        return this.organizationsService.createInvite(slug, user.id, dto);
    }

    @Post('join')
    join(@CurrentUser() user: AuthUser, @Body() dto: JoinOrganizationDto) {
        return this.organizationsService.joinByInvite(user.id, dto);
    }
}
