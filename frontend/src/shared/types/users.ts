import type { TypeOrNull } from './utility';

export type User = {
    id: string;
    username: string;
    avatarUrl: TypeOrNull<string>;
    email: string;
};
