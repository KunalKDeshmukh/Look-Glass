import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-sm mx-auto py-16">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Account</div>
      <h1 className="font-serif text-3xl mt-2 text-ink mb-7">{user.name}</h1>
      <p className="text-sm text-muted mb-1">Email</p>
      <p className="text-sm text-ink mb-7">{user.email}</p>
      <button onClick={logout} className="border border-ink text-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-canvas transition-colors">
        Sign out
      </button>
    </div>
  );
}
