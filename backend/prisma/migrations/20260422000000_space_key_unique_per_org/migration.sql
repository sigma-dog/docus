-- Drop global unique constraint on Space.key
DROP INDEX "Space_key_key";

-- Add composite unique constraint (key, organizationId)
CREATE UNIQUE INDEX "Space_key_organizationId_key" ON "Space"("key", "organizationId");
