-- Add tsvector column for full-text search
ALTER TABLE "Page" ADD COLUMN "searchVector" tsvector
    GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED;

-- GIN index for fast @@ queries
CREATE INDEX "page_search_vector_gin_idx" ON "Page" USING GIN ("searchVector");
