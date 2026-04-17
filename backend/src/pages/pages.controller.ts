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
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@UseGuards(JwtAuthGuard)
@Controller('spaces/:key/pages')
export class PagesController {
    constructor(private pagesService: PagesService) {}

    @Post()
    create(
        @Param('key') key: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: CreatePageDto
    ) {
        return this.pagesService.create(key, user.id, dto);
    }

    @Get()
    findTree(@Param('key') key: string, @CurrentUser() user: AuthUser) {
        return this.pagesService.findTree(key, user.id);
    }

    @Get(':pageId')
    findOne(
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.pagesService.findOne(key, pageId, user.id);
    }

    @Patch(':pageId')
    update(
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdatePageDto
    ) {
        return this.pagesService.update(key, pageId, user.id, dto);
    }

    @Delete(':pageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.pagesService.remove(key, pageId, user.id);
    }

    @Patch(':pageId/move')
    move(
        @Param('key') key: string,
        @Param('pageId') pageId: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: MovePageDto
    ) {
        return this.pagesService.move(key, pageId, user.id, dto);
    }
}
