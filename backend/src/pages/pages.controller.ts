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
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { type AuthUser } from '../common/types/auth.types';
import { CreatePageDto } from './dto/create-page.dto';
import { MovePageDto } from './dto/move-page.dto';
import { RestorePageDto } from './dto/restore-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageHistoryService } from './page-history.service';
import { PagesService } from './pages.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations/:orgSlug/spaces/:key/pages')
export class PagesController {
    constructor(
        private pagesService: PagesService,
        private pageHistoryService: PageHistoryService
    ) {}

    @Post()
    create(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: CreatePageDto
    ) {
        return this.pagesService.create(key, user.id, dto, orgSlug);
    }

    @Get()
    findTree(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.pagesService.findTree(key, user.id, orgSlug);
    }

    @Get(':pageId')
    findOne(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.pagesService.findOne(key, pageId, user.id, orgSlug);
    }

    @Patch(':pageId')
    update(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdatePageDto
    ) {
        return this.pagesService.update(key, pageId, user.id, dto, orgSlug);
    }

    @Delete(':pageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.pagesService.remove(key, pageId, user.id, orgSlug);
    }

    @Patch(':pageId/move')
    move(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: MovePageDto
    ) {
        return this.pagesService.move(key, pageId, user.id, dto, orgSlug);
    }

    @Post(':pageId/restore')
    restore(
        @Param('orgSlug') orgSlug: string,
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: RestorePageDto
    ) {
        return this.pagesService.restore(
            key,
            pageId,
            user.id,
            dto.historyEntryId,
            orgSlug
        );
    }

    @Get(':pageId/history')
    getHistory(@Param('pageId') pageId: string) {
        return this.pageHistoryService.findAll(pageId);
    }
}
