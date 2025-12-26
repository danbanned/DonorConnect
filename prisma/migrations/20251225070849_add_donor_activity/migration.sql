-- CreateTable
CREATE TABLE "DonorActivity" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DonorActivity" ADD CONSTRAINT "DonorActivity_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
