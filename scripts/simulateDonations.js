const { simulateDonation } = require("../lib/donationSimulator");

console.log("🚀 Donation simulator started...");

// Run every 1–5 minutes randomly
setInterval(() => {
  simulateDonation();
}, Math.floor(Math.random() * (5 - 1 + 1) + 1) * 60 * 1000); // 1–5 min
