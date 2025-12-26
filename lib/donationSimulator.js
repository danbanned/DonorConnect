const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function randomAmount() {
  return Math.floor(Math.random() * 5000) + 25; // $25–$5,000
}

async function simulateDonation() {
  const donors = await prisma.donor.findMany();

  if (donors.length === 0) return;

  const donor = donors[Math.floor(Math.random() * donors.length)];
  const amount = randomAmount();

  const donation = await prisma.donation.create({
    data: {
      donorId: donor.id,
      amount,
    },
  });

  await prisma.donorActivity.create({
    data: {
      donorId: donor.id,
      action: "Made a donation",
      amount,
      details: { donationId: donation.id, simulated: true },
    },
  });

  console.log(`💸 ${donor.name} donated $${amount.toLocaleString()}`);
}

module.exports = { simulateDonation };
