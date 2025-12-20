/*
  Warnings:

  - You are about to drop the column `address` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `firstGiftDate` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `giftsCount` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `hasActivePledge` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `lastContact` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `lastGiftDate` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `nextFollowUp` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `pledgeEndDate` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `pledgeFrequency` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `pledgePaid` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `pledgeStartDate` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `pledgeTotal` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `totalGiven` on the `Donor` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PledgeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "Donor_organizationId_lastGiftDate_idx";

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "address",
DROP COLUMN "firstGiftDate",
DROP COLUMN "giftsCount",
DROP COLUMN "hasActivePledge",
DROP COLUMN "interests",
DROP COLUMN "lastContact",
DROP COLUMN "lastGiftDate",
DROP COLUMN "nextFollowUp",
DROP COLUMN "pledgeEndDate",
DROP COLUMN "pledgeFrequency",
DROP COLUMN "pledgePaid",
DROP COLUMN "pledgeStartDate",
DROP COLUMN "pledgeTotal",
DROP COLUMN "tags",
DROP COLUMN "totalGiven";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "donorId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorInterest" (
    "donorId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,

    CONSTRAINT "DonorInterest_pkey" PRIMARY KEY ("donorId","interestId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorTag" (
    "donorId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "DonorTag_pkey" PRIMARY KEY ("donorId","tagId")
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frequency" "PledgeFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PledgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_donorId_key" ON "Address"("donorId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorInterest" ADD CONSTRAINT "DonorInterest_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorInterest" ADD CONSTRAINT "DonorInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorTag" ADD CONSTRAINT "DonorTag_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorTag" ADD CONSTRAINT "DonorTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
