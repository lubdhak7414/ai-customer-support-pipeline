import { Bot, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listTicketsRequest, regenerateTicketAiRequest } from "../api/tickets";

const CATEGORY_OPTIONS = [
  "All",
  "Billing",
  "Technical Support",
  "General Inquiry",
];
const PRIORITY_OPTIONS = ["All", "High", "Medium", "Low"];

const priorityStyles = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function TicketDashboard({ refreshSeed = 0 }) {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState({});

  const query = useMemo(() => {
    const next = {};
    if (category !== "All") {
      next.category = category;
    }
    if (priority !== "All") {
      next.priority = priority;
    }
    return next;
  }, [category, priority]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await listTicketsRequest(query);
      setTickets(response.data || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshSeed, category, priority]);

  const handleRegenerate = async (ticketId) => {
    setRegenerating((prev) => ({ ...prev, [ticketId]: true }));

    try {
      await regenerateTicketAiRequest(ticketId);
      await fetchTickets();
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message || "Failed to regenerate AI reply",
      );
    } finally {
      setRegenerating((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-card">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Ticket Dashboard</h2>
          <p className="text-sm text-slate-600">
            Filter tickets by category and priority.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {CATEGORY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {PRIORITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-28 items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tickets...
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && tickets.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          No tickets found for the selected filters.
        </p>
      ) : null}

      {!isLoading && !error && tickets.length > 0 ? (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <article
              key={ticket._id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {ticket.category} • {ticket.sentiment} • {ticket.aiStatus}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                    priorityStyles[ticket.priority] ||
                    "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {ticket.priority || "Medium"}
                </span>
              </div>

              <p className="mb-3 text-sm text-slate-700">
                {ticket.description}
              </p>

              <div className="rounded-lg bg-brand-100/60 p-3">
                <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-900">
                  <Bot className="h-3.5 w-3.5" /> AI Suggested Reply
                </p>
                <p className="text-sm text-slate-800">
                  {ticket.suggestedReply ||
                    "AI reply not available yet. Regenerate if needed."}
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRegenerate(ticket._id)}
                  disabled={Boolean(regenerating[ticket._id])}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {regenerating[ticket._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  {regenerating[ticket._id]
                    ? "Regenerating..."
                    : "Regenerate AI Reply"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
