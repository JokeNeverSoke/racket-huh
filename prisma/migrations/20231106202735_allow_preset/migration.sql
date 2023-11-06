-- AlterTable
ALTER TABLE "RacketCode" ADD COLUMN     "presetId" INTEGER;

-- AddForeignKey
ALTER TABLE "RacketCode" ADD CONSTRAINT "RacketCode_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "RacketCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
