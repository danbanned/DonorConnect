-- AlterEnum
ALTER TYPE "DonorStatus" ADD VALUE 'LYBUNT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RelationshipStage" ADD VALUE 'SYBUNT';
ALTER TYPE "RelationshipStage" ADD VALUE 'LYBUNT';
ALTER TYPE "RelationshipStage" ADD VALUE 'CURRENT';
