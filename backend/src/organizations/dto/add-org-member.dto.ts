import { IsEnum, IsString } from 'class-validator';

export const OrgMemberRole = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export type OrgMemberRole = (typeof OrgMemberRole)[keyof typeof OrgMemberRole];

export class AddOrgMemberDto {
    @IsString()
    userId: string;

    @IsEnum(OrgMemberRole)
    role: OrgMemberRole;
}
