import type { TypeOrNull } from './utility';

export type SpaceRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type SpaceAccessSource =
    | 'organization_owner'
    | 'organization_admin'
    | 'organization_member'
    | 'space_owner'
    | 'space_member';

export type SpaceMember = {
    id: string;
    role: SpaceRole;
    spaceId: string;
    userId: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl: TypeOrNull<string>;
    };
};

export type SpaceAccessMember = {
    userId: string;
    role: SpaceRole;
    source: SpaceAccessSource;
    isOrgMember: boolean;
    hasExplicitAccess: boolean;
    user: {
        id: string;
        username: string;
        avatarUrl: TypeOrNull<string>;
    };
};

export type Space = {
    id: string;
    name: string;
    key: string;
    description: TypeOrNull<string>;
    avatarUrl: TypeOrNull<string>;
    ownerId: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        pages: number;
        members: number;
    };
    members?: SpaceMember[];
    accessMembers?: SpaceAccessMember[];
};
