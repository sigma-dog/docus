import type { TypeOrNull } from './utility';

type PageAuthor = {
    id: string;
    username: string;
    avatarUrl: TypeOrNull<string>;
};

export type Page = {
    id: string;
    title: string;
    content: TypeOrNull<string>;
    isFolder: boolean;
    position: number;
    spaceId: string;
    parentId: TypeOrNull<string>;
    authorId: string;
    author: PageAuthor;
    createdAt: string;
    updatedAt: string;
    children: Page[];
};
