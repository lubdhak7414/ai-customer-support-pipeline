import { LogOut, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import TicketCreationForm from "./components/TicketCreationForm";
import TicketDashboard from "./components/TicketDashboard";
import { useAuth } from "./hooks/useAuth";

function AuthPanel() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const submitLabel = useMemo(() => {
    if (loading) {
      return mode === "login" ? "Signing in..." : "Creating account...";
    }

    return mode === "login" ? "Sign In" : "Create Account";
  }, [loading, mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email.trim(), form.password);
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-card">
        <h1 className="text-2xl font-bold text-brand-900">AI Support Desk</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to create and track support tickets.
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-brand-900 shadow"
                : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-brand-900 shadow"
                : "text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          ) : null}

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          {mode === "register" ? (
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
          >
            {submitLabel}
          </button>
        </form>
      </section>
    </main>
  );
}

function DashboardShell() {
  const { user, logout } = useAuth();
  const [refreshSeed, setRefreshSeed] = useState(0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">
            Customer Support Desk
          </h1>
          <p className="text-sm text-slate-600">
            MVP ticketing workflow with AI triage and drafted replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
            {user?.name} ({user?.role})
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <TicketCreationForm
          onCreated={() => {
            setRefreshSeed((prev) => prev + 1);
          }}
        />
        <TicketDashboard refreshSeed={refreshSeed} />
      </div>
    </main>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPanel />;
  }

  return <DashboardShell />;
}
