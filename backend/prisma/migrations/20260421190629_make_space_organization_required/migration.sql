/*
  Warnings:

  - Made the column `organizationId` on table `Space` required. This step will fail if there are existing NULL values in that column.

*/
-- Delete spaces without an organization (dev data cleanup)
DELETE FROM "Space" WHERE "organizationId" IS NULL;

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_organizationId_fkey";

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
