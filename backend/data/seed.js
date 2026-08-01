/**
 * Manual seed command for local development.
 * Run with: npm run seed
 * (On Render/production, seeding also happens automatically on server
 * startup — see the seedDatabase() call in server.js — since free-tier
 * ephemeral filesystems get wiped on every restart.)
 */
require("dotenv").config();
const { seedDatabase } = require("./seedDatabase");

seedDatabase({ force: true }).then(() => {
  console.log("Seed complete.");
  process.exit(0);
});