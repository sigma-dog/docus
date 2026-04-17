import { Module } from '@nestjs/common';

import { SpacesModule } from '../spaces/spaces.module';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
    imports: [SpacesModule],
    controllers: [PagesController],
    providers: [PagesService],
})
export class PagesModule {}
