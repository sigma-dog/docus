import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';

@Module({
    imports: [OrganizationsModule],
    controllers: [SpacesController],
    providers: [SpacesService],
    exports: [SpacesService],
})
export class SpacesModule {}
