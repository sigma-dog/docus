-- CreateTable
CREATE TABLE "PageHistory" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageHistory_pageId_createdAt_idx" ON "PageHistory"("pageId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "PageHistory" ADD CONSTRAINT "PageHistory_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageHistory" ADD CONSTRAINT "PageHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
