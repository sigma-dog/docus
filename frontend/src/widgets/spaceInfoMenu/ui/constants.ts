import type { SpaceAccessSource, SpaceRole } from 'shared/types';

export const roleLabels: Record<SpaceRole, string> = {
    ADMIN: 'Администратор',
    EDITOR: 'Редактор',
    VIEWER: 'Наблюдатель',
};

export const editableRoles = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
export type EditableSpaceRole = (typeof editableRoles)[number];

export const sourceLabels: Record<SpaceAccessSource, string> = {
    organization_owner: 'Владелец организации',
    organization_admin: 'Админ организации',
    organization_member: 'Участник организации',
    space_owner: 'Владелец пространства',
    space_member: 'Роль пространства',
};
