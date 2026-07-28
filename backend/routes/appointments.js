const express = require("express");
const { body, validationResult } = require("express-validator");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");

const router = express.Router();

const VALID_DEPARTMENTS = ["cardiology", "neurology", "orthopedics", "ent", "dental", "general"];

// POST /api/appointments - book an appointment (works for guests and logged-in users)
router.post(
  "/",
  optionalAuth,
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("department").isIn(VALID_DEPARTMENTS).withMessage("Please select a valid department."),
    body("date").isISO8601().withMessage("Please select a valid date."),
    body("time").matches(/^\d{2}:\d{2}$/).withMessage("Please select a valid time."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const appointment = Appointment.create({
      ...req.body,
      userId: req.user ? req.user.id : null,
    });
    res.status(201).json({ appointment });
  }
);

// GET /api/appointments/me - the logged-in user's own appointments
router.get("/me", requireAuth, (req, res) => {
  res.json({ appointments: Appointment.findByUser(req.user.id) });
});

// GET /api/appointments - all appointments (admin only)
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  res.json({ appointments: Appointment.findAll() });
});

// PATCH /api/appointments/:id/status - update status (admin only)
router.patch("/:id/status", requireAuth, requireRole("admin"), (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "confirmed", "cancelled", "completed"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${valid.join(", ")}` });
  }

  const appointment = Appointment.updateStatus(req.params.id, status);
  if (!appointment) return res.status(404).json({ error: "Appointment not found." });
  res.json({ appointment });
});

// DELETE /api/appointments/:id - cancel/delete (owner or admin)
router.delete("/:id", requireAuth, (req, res) => {
  const appointment = Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ error: "Appointment not found." });

  const isOwner = appointment.userId === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ error: "You can only cancel your own appointments." });
  }

  Appointment.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
