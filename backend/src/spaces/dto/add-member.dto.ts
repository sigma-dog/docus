import { IsEnum, IsString } from 'class-validator';

export enum SpaceMemberRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
}

export class AddMemberDto {
    @IsString()
    userId: string;

    @IsEnum(SpaceMemberRole)
    role: SpaceMemberRole;
}
