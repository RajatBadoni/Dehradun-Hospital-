require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const contactRoutes = require("./routes/contact");
const { seedDatabase } = require("./data/seedDatabase");

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Basic rate limiting to slow down brute-force / spam on public endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/contact", contactRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
});

const PORT = process.env.PORT || 5000;

// Seed doctors + default admin if the database is empty. This runs on
// every startup (not just once) because free-tier hosts like Render
// wipe the filesystem on every restart/redeploy/spin-down.
seedDatabase()
  .catch((err) => console.error("⚠️ Seeding failed:", err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Doon Hospital backend running on http://localhost:${PORT}`);
    });
  });