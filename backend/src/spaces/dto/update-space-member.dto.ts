import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { SpaceMemberRole } from './add-member.dto';

export class UpdateSpaceMemberDto {
    @IsOptional()
    @IsEnum(SpaceMemberRole)
    role?: SpaceMemberRole;

    @IsOptional()
    @IsBoolean()
    inherit?: boolean;
}
