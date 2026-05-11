import { Module } from '@nestjs/common';

import { S3Module } from '../S3/S3.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';

@Module({
    imports: [OrganizationsModule, S3Module],
    controllers: [SpacesController],
    providers: [SpacesService],
    exports: [SpacesService],
})
export class SpacesModule {}
