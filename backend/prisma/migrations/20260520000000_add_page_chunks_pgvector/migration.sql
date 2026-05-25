CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "PageChunk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "spaceKey" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageChunk_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PageChunk_pageId_chunkIndex_key" ON "PageChunk"("pageId", "chunkIndex");
CREATE INDEX "PageChunk_organizationId_idx" ON "PageChunk"("organizationId");
CREATE INDEX "PageChunk_pageId_idx" ON "PageChunk"("pageId");
CREATE INDEX "PageChunk_embedding_idx" ON "PageChunk" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
