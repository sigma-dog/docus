import { createListCollection } from '@chakra-ui/react';

import type { OrgMember } from 'shared/types';

export const roleLabels: Record<OrgMember['role'], string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
};

export const editableRoles = ['ADMIN', 'MEMBER'] as const;

export type EditableOrgRole = (typeof editableRoles)[number];

export const inviteRoleOptions = createListCollection({
    items: editableRoles.map((role) => ({
        label: roleLabels[role],
        value: role,
    })),
});
