import type { TypeOrNull } from './utility';

type PageAuthor = {
    id: string;
    username: string;
    avatarUrl: TypeOrNull<string>;
};

export type PageSummary = {
    id: string;
    title: string;
    isFolder: boolean;
    position: number;
    spaceId: string;
    parentId: TypeOrNull<string>;
    authorId: string;
    author: PageAuthor;
    createdAt: string;
    updatedAt: string;
    children: PageSummary[];
};

export type Page = PageSummary & {
    content: TypeOrNull<string>;
};
