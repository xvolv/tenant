/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,nationalId]` on the table `renters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "renters_nationalId_key";

-- AlterTable
ALTER TABLE "renters" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "renters_ownerId_nationalId_key" ON "renters"("ownerId", "nationalId");

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
