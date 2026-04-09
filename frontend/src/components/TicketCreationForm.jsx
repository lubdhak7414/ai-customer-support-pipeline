import { Loader2, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { createTicketRequest } from "../api/tickets";

const initialForm = {
  title: "",
  description: "",
};

export default function TicketCreationForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.title.trim().length < 5 || form.description.trim().length < 10) {
      setError("Please provide a longer title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createTicketRequest({
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setForm(initialForm);
      onCreated(response.data);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-card">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-brand-900">
          Create Support Ticket
        </h2>
        <p className="text-sm text-slate-600">
          Describe your issue and AI will triage it automatically.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
            placeholder="e.g. Charged twice for monthly plan"
            maxLength={160}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
            placeholder="Include steps, error messages, and expected outcome."
            maxLength={5000}
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </section>
  );
}
