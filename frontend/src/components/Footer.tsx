import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-line/50 mt-16 bg-canvas/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-serif text-lg text-ink">LOOKGLASS</span>
        <span className="font-mono text-[11px] tracking-widest uppercase text-muted">Your mirror, made intelligent.</span>
        <span className="font-mono text-[11px] tracking-widest uppercase text-muted">Developed by Kunal Deshmukh</span>
      </div>
    </footer>
  );
}
