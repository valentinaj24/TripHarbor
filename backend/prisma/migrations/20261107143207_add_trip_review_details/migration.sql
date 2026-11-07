-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3);
