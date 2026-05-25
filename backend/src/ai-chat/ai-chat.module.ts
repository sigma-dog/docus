import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';

@Module({
    imports: [OrganizationsModule],
    controllers: [AiChatController],
    providers: [AiChatService],
    exports: [AiChatService],
})
export class AiChatModule {}
