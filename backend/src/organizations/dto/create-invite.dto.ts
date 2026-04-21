import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export const InviteRole = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export type InviteRole = (typeof InviteRole)[keyof typeof InviteRole];

export class CreateInviteDto {
    @IsOptional()
    @IsEnum(InviteRole)
    role?: InviteRole;

    @IsOptional()
    @IsISO8601()
    expiresAt?: string;
}
