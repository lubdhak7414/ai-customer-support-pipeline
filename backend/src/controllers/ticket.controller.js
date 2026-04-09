const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { runTicketAiPipeline } = require("../jobs/ticketAi.job");

const parseFilters = (query) => {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }
  if (query.sentiment) {
    filters.sentiment = query.sentiment;
  }
  if (query.priority) {
    filters.priority = query.priority;
  }

  return filters;
};

const createTicket = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const ticket = await Ticket.create({
    title: req.body.title,
    description: req.body.description,
    createdBy: req.user._id,
    aiStatus: "pending",
  });

  // Fire-and-forget keeps API latency low for MVP while still enriching ticket data.
  runTicketAiPipeline(ticket._id).catch((error) => {
    console.error("Background AI pipeline failed", error);
  });

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

const getTickets = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const filters = parseFilters(req.query);

  if (req.user.role !== "admin") {
    filters.createdBy = req.user._id;
  }

  const tickets = await Ticket.find(filters)
    .populate("createdBy", "_id name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

const regenerateAi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid ticket id", 400);
  }

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  ticket.aiStatus = "pending";
  ticket.aiMeta.lastError = "";
  await ticket.save();

  runTicketAiPipeline(ticket._id).catch((error) => {
    console.error("Background AI regeneration failed", error);
  });

  res.status(202).json({
    success: true,
    message: "AI regeneration started",
  });
});

module.exports = {
  createTicket,
  getTickets,
  regenerateAi,
};
