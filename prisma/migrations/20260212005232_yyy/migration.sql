-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "lastDonationAmount" DOUBLE PRECISION,
ADD COLUMN     "lastDonationDate" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalDonations" INTEGER DEFAULT 0;
