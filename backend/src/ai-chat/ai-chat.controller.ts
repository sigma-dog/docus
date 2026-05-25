import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { type AuthUser } from '../common/types/auth.types';
import { AiChatService } from './ai-chat.service';
import { AskAiDto } from './dto/ask-ai.dto';

@UseGuards(JwtAuthGuard)
@Controller('organizations/:slug/ai')
export class AiChatController {
    constructor(private readonly aiChatService: AiChatService) {}

    @Post('chat')
    ask(
        @Param('slug') slug: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: AskAiDto
    ) {
        return this.aiChatService.ask(slug, user.id, dto);
    }

    @Post('reindex')
    reindex(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
        return this.aiChatService.reindex(slug, user.id);
    }
}
