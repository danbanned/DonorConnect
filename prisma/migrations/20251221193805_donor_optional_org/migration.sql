-- DropForeignKey
ALTER TABLE "Donor" DROP CONSTRAINT "Donor_organizationId_fkey";

-- AlterTable
ALTER TABLE "Donor" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Donor" ADD CONSTRAINT "Donor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
