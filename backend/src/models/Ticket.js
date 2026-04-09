const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Billing", "Technical Support", "General Inquiry"],
      default: "General Inquiry",
      index: true,
    },
    sentiment: {
      type: String,
      enum: ["Angry", "Neutral", "Happy"],
      default: "Neutral",
      index: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    suggestedReply: {
      type: String,
      default: "",
    },
    aiStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    aiMeta: {
      model: { type: String, default: "" },
      processedAt: { type: Date, default: null },
      lastError: { type: String, default: "" },
      raw: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
