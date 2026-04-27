-- Drop the GENERATED column (can't be altered, only dropped and recreated)
ALTER TABLE "Page" DROP COLUMN "searchVector";

-- Recreate as a regular nullable column
ALTER TABLE "Page" ADD COLUMN "searchVector" tsvector;

-- Trigger function: strips HTML tags before building tsvector
CREATE OR REPLACE FUNCTION page_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW."searchVector" := to_tsvector(
        'simple',
        coalesce(NEW.title, '') || ' ' ||
        coalesce(regexp_replace(NEW.content, '<[^>]+>', ' ', 'g'), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fire on every INSERT and UPDATE
CREATE TRIGGER page_search_vector_trigger
    BEFORE INSERT OR UPDATE ON "Page"
    FOR EACH ROW EXECUTE FUNCTION page_search_vector_update();

-- Backfill existing rows
UPDATE "Page" SET title = title;

-- Recreate GIN index
DROP INDEX IF EXISTS "page_search_vector_gin_idx";
CREATE INDEX "page_search_vector_gin_idx" ON "Page" USING GIN ("searchVector");
