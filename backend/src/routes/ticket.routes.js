const express = require("express");
const { body, query } = require("express-validator");
const {
  createTicket,
  getTickets,
  regenerateAi,
} = require("../controllers/ticket.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  [
    query("category")
      .optional()
      .isIn(["Billing", "Technical Support", "General Inquiry"]),
    query("sentiment").optional().isIn(["Angry", "Neutral", "Happy"]),
    query("priority").optional().isIn(["High", "Medium", "Low"]),
  ],
  getTickets,
);

router.post(
  "/",
  [
    body("title").trim().isLength({ min: 5, max: 160 }),
    body("description").trim().isLength({ min: 10, max: 5000 }),
  ],
  createTicket,
);

router.post("/:id/regenerate-ai", requireRole("admin"), regenerateAi);

module.exports = router;
