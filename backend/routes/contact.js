const express = require("express");
const { body, validationResult } = require("express-validator");

const Contact = require("../models/Contact");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// POST /api/contact - submit the "Contact Us" form
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("subject").trim().notEmpty().withMessage("Subject is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const contact = Contact.create(req.body);
    res.status(201).json({ contact });
  }
);

// GET /api/contact - list all messages (admin only)
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  res.json({ contacts: Contact.findAll() });
});

// PATCH /api/contact/:id/resolve - mark a message as resolved (admin only)
router.patch("/:id/resolve", requireAuth, requireRole("admin"), (req, res) => {
  const contact = Contact.markResolved(req.params.id);
  if (!contact) return res.status(404).json({ error: "Message not found." });
  res.json({ contact });
});

module.exports = router;
