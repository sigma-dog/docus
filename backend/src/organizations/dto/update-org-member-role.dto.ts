import { IsEnum } from 'class-validator';

import { OrgMemberRole } from './add-org-member.dto';

export class UpdateOrgMemberRoleDto {
    @IsEnum(OrgMemberRole)
    role: (typeof OrgMemberRole)[keyof typeof OrgMemberRole];
}
