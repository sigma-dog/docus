import type { PageHistoryEntry } from 'shared/types';

export type Part = { html: string; bg: string };

export type VersionState = {
    title: string;
    content: string | null;
};

export type DiffTarget = {
    entry: PageHistoryEntry;
    next: PageHistoryEntry | null;
    currentTitle: string;
    currentContent: string | null;
};
