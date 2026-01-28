/*
  Warnings:

  - You are about to drop the column `details` on the `DonorActivity` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `DonorActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `DonorActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `DonorActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropIndex
DROP INDEX "Task_userId_idx";

-- AlterTable
ALTER TABLE "DonorActivity" DROP COLUMN "details",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "importance" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "relatedCommunicationId" TEXT,
ADD COLUMN     "relatedDonationId" TEXT,
ADD COLUMN     "relatedMeetingId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "userId",
ADD COLUMN     "assignedToId" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityFeed" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "donorId" TEXT,
    "donationId" TEXT,
    "action" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION,
    "metadata" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ActivityFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityFeed_organizationId_createdAt_idx" ON "ActivityFeed"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityFeed_organizationId_donorId_idx" ON "ActivityFeed"("organizationId", "donorId");

-- CreateIndex
CREATE INDEX "ActivityFeed_organizationId_userId_idx" ON "ActivityFeed"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "ActivityFeed_organizationId_isRead_idx" ON "ActivityFeed"("organizationId", "isRead");

-- CreateIndex
CREATE INDEX "DonorActivity_organizationId_type_createdAt_idx" ON "DonorActivity"("organizationId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "DonorActivity_organizationId_donorId_type_idx" ON "DonorActivity"("organizationId", "donorId", "type");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorActivity" ADD CONSTRAINT "DonorActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorActivity" ADD CONSTRAINT "DonorActivity_relatedDonationId_fkey" FOREIGN KEY ("relatedDonationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorActivity" ADD CONSTRAINT "DonorActivity_relatedMeetingId_fkey" FOREIGN KEY ("relatedMeetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorActivity" ADD CONSTRAINT "DonorActivity_relatedCommunicationId_fkey" FOREIGN KEY ("relatedCommunicationId") REFERENCES "Communication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
