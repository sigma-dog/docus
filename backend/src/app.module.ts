import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpacesModule } from './spaces/spaces.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        SpacesModule,
        PagesModule,
        OrganizationsModule,
    ],
})
export class AppModule {}
