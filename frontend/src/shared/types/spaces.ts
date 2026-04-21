import type { TypeOrNull } from './utility';

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
};
