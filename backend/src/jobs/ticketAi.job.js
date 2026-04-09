const Ticket = require("../models/Ticket");
const { analyzeTicketWithAi } = require("../services/ai.service");

const runTicketAiPipeline = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return;
  }

  ticket.aiStatus = "processing";
  ticket.aiMeta.lastError = "";
  await ticket.save();

  try {
    const aiResult = await analyzeTicketWithAi({
      title: ticket.title,
      description: ticket.description,
    });

    ticket.category = aiResult.category;
    ticket.sentiment = aiResult.sentiment;
    ticket.priority = aiResult.priority;
    ticket.suggestedReply = aiResult.suggestedReply;
    ticket.aiStatus = "completed";
    ticket.aiMeta.model = aiResult.model;
    ticket.aiMeta.processedAt = new Date();
    ticket.aiMeta.raw = aiResult.raw;
    ticket.aiMeta.lastError = "";

    await ticket.save();
  } catch (error) {
    ticket.aiStatus = "failed";
    ticket.aiMeta.processedAt = new Date();
    ticket.aiMeta.lastError = error.message;
    await ticket.save();
  }
};

module.exports = {
  runTicketAiPipeline,
};
