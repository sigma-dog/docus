export type RagSource = {
    pageId: string;
    title: string;
    spaceKey: string;
    chunkText: string;
    score?: number | null;
};

export type RagQueryResponse = {
    answer: string;
    sources: RagSource[];
    usedChunksCount: number;
};

export type RagPagePayload = {
    organizationId: string;
    organizationSlug: string;
    spaceId: string;
    spaceKey: string;
    pageId: string;
    title: string;
    content: string | null;
    isFolder: boolean;
    updatedAt: Date | string;
};
