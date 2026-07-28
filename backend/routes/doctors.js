const express = require("express");
const { body, validationResult } = require("express-validator");

const Doctor = require("../models/Doctor");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/doctors?department=cardiology
router.get("/", (req, res) => {
  const { department } = req.query;
  const doctors = department ? Doctor.findByDepartment(department) : Doctor.findAll();
  res.json({ doctors });
});

// GET /api/doctors/:id
router.get("/:id", (req, res) => {
  const doctor = Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ error: "Doctor not found." });
  res.json({ doctor });
});

// POST /api/doctors (admin only)
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("name").trim().notEmpty(),
    body("department").trim().notEmpty(),
    body("specialty").trim().notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const doctor = Doctor.create(req.body);
    res.status(201).json({ doctor });
  }
);

// PUT /api/doctors/:id (admin only)
router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const doctor = Doctor.update(req.params.id, req.body);
  if (!doctor) return res.status(404).json({ error: "Doctor not found." });
  res.json({ doctor });
});

// DELETE /api/doctors/:id (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const existed = Doctor.remove(req.params.id);
  if (!existed) return res.status(404).json({ error: "Doctor not found." });
  res.status(204).send();
});

module.exports = router;
