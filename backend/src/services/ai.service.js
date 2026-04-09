const env = require("../config/env");
const AppError = require("../utils/AppError");

const SYSTEM_PROMPT = `You are an NLP support triage engine.
Return ONLY valid JSON with this exact schema:
{
  "category": "Billing | Technical Support | General Inquiry",
  "sentiment": "Angry | Neutral | Happy",
  "priority": "High | Medium | Low",
  "suggestedReply": "string"
}

Rules:
1) Category must be one of Billing, Technical Support, General Inquiry.
2) Sentiment must be one of Angry, Neutral, Happy.
3) Priority must map from sentiment exactly:
   Angry -> High
   Neutral -> Medium
   Happy -> Low
4) suggestedReply must be concise, empathetic, and actionable.
5) Do not include markdown, code blocks, or any extra keys.`;

const CATEGORY_VALUES = ["Billing", "Technical Support", "General Inquiry"];
const SENTIMENT_VALUES = ["Angry", "Neutral", "Happy"];
const PRIORITY_VALUES = ["High", "Medium", "Low"];

const normalizeAiOutput = (payload) => {
  const normalized = {
    category: CATEGORY_VALUES.includes(payload.category)
      ? payload.category
      : "General Inquiry",
    sentiment: SENTIMENT_VALUES.includes(payload.sentiment)
      ? payload.sentiment
      : "Neutral",
    priority: PRIORITY_VALUES.includes(payload.priority)
      ? payload.priority
      : "Medium",
    suggestedReply:
      typeof payload.suggestedReply === "string"
        ? payload.suggestedReply.trim()
        : "",
  };

  if (!normalized.suggestedReply) {
    normalized.suggestedReply =
      "Thanks for reaching out. Our support team has reviewed your request and will follow up shortly with next steps.";
  }

  return normalized;
};

const analyzeTicketWithAi = async ({ title, description }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${env.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.ollamaModel,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({ title, description }),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        `Ollama request failed: ${response.status} ${errorText}`,
        502,
      );
    }

    const payload = await response.json();
    const raw = payload?.message?.content;
    if (!raw) {
      throw new AppError("AI returned an empty response", 502);
    }

    const parsed = JSON.parse(raw);
    const normalized = normalizeAiOutput(parsed);

    return {
      ...normalized,
      raw: parsed,
      model: env.ollamaModel,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError("Ollama request timed out", 504);
    }

    if (error instanceof AppError) {
      throw error;
    }

    const message = error?.message || "AI analysis failed";
    throw new AppError(message, 502);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  SYSTEM_PROMPT,
  analyzeTicketWithAi,
};
