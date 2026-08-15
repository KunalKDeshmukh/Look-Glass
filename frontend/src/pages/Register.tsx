import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      notify("Account created — welcome to LOOKGLASS.");
      navigate("/");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create that account — try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Join LOOKGLASS</div>
      <h1 className="font-serif text-3xl mt-2 text-ink mb-7">Create an account.</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2.5 bg-panel border border-line/60 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2.5 bg-panel border border-line/60 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="px-3 py-2.5 bg-panel border border-line/60 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet" />
        </label>
        {error && <p className="text-sm text-[#8B3A3A]">{error}</p>}
        <button disabled={busy} type="submit" className="mt-2 bg-ink text-canvas px-5 py-3 text-sm font-medium tracking-wide hover:bg-violet disabled:opacity-50 transition-colors">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already have one? <Link to="/login" className="text-ink underline underline-offset-4 decoration-line hover:decoration-ink">Sign in</Link>
      </p>
    </div>
  );
}
