import { Module } from '@nestjs/common';

import { S3Module } from '../S3/S3.module';
import { SpacesModule } from '../spaces/spaces.module';
import { PageHistoryService } from './page-history.service';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
    imports: [SpacesModule, S3Module],
    controllers: [PagesController],
    providers: [PagesService, PageHistoryService],
})
export class PagesModule {}
