import type { TypeOrNull } from './utility';

type HistoryAuthor = {
    id: string;
    username: string;
    avatarUrl: TypeOrNull<string>;
};

export type PageHistoryEntry = {
    id: string;
    pageId: string;
    authorId: string;
    author: HistoryAuthor;
    title: string;
    content: TypeOrNull<string>;
    createdAt: string;
};

type PageAuthor = {
    id: string;
    username: string;
    avatarUrl: TypeOrNull<string>;
};

export type PageSummary = {
    id: string;
    title: string;
    icon: TypeOrNull<string>;
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

export type SearchSnippet = {
    before: string;
    match: string;
    after: string;
};

export type SearchResult = {
    id: string;
    title: string;
    spaceKey: string;
    snippet: SearchSnippet | null;
};
