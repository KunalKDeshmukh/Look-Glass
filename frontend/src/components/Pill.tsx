import React from "react";

interface Props {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Pill({ active, onClick, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
        active ? "bg-ink text-canvas border-ink" : "bg-transparent text-ink border-line hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
