-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_parentId_fkey";

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
