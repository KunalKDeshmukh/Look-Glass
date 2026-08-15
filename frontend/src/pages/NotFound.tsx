import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">404</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink">This edit doesn't exist.</h1>
      <p className="mt-3 text-sm text-muted">The page you're looking for isn't in the collection.</p>
      <Link to="/" className="inline-block mt-6 bg-ink text-canvas px-5 py-3 text-sm font-medium hover:bg-violet transition-colors">
        Back to LOOKGLASS
      </Link>
    </div>
  );
}
