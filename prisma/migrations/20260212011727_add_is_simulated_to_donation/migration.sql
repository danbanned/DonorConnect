/*
  Warnings:

  - You are about to drop the column `lastDonationAmount` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `lastDonationDate` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `totalDonations` on the `Donor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "isSimulated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "lastDonationAmount",
DROP COLUMN "lastDonationDate",
DROP COLUMN "totalAmount",
DROP COLUMN "totalDonations";
