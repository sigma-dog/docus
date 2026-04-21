import type { TypeOrNull } from './utility';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type OrgMember = {
    id: string;
    role: OrgRole;
    organizationId: string;
    userId: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl: TypeOrNull<string>;
    };
    organization?: {
        id: string;
        name: string;
        slug: string;
        avatarUrl: TypeOrNull<string>;
    };
};

export type OrganizationInvite = {
    id: string;
    code: string;
    role: OrgRole;
    expiresAt: string | null;
    createdAt: string;
    organization: {
        id: string;
        name: string;
        slug: string;
    };
};

export type Organization = {
    id: string;
    name: string;
    slug: string;
    description: TypeOrNull<string>;
    avatarUrl: TypeOrNull<string>;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        members: number;
        spaces: number;
    };
    members?: OrgMember[];
};
