import React from "react";
import { Category } from "../types";

interface Props {
  category: Category | string;
  className?: string;
  strokeWidth?: number;
}

// Hand-sketch garment silhouettes — the site's signature illustration
// system, used everywhere a product photo would normally go.
export default function GarmentIcon({ category, className = "", strokeWidth = 1.4 }: Props) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    dress: <path {...common} d="M40 12 Q50 22 60 12 L64 26 L56 30 L64 88 L36 88 L44 30 L36 26 Z" />,
    top: <path {...common} d="M30 22 L40 14 L50 20 L60 14 L70 22 L64 34 L58 30 L58 86 L42 86 L42 30 L36 34 Z" />,
    jacket: <path {...common} d="M32 20 L46 12 L50 18 L54 12 L68 20 L68 34 L60 30 L60 88 L40 88 L40 30 L32 34 Z M46 12 L50 40 L54 12" />,
    bottoms: <path {...common} d="M34 12 L66 12 L68 88 L54 88 L50 34 L46 88 L32 88 Z" />,
    shoes: <path {...common} d="M18 60 Q18 48 34 46 Q46 44 52 52 Q64 52 78 58 Q84 62 82 68 L20 68 Q16 66 18 60 Z" />,
    bag: <path {...common} d="M26 38 Q26 18 50 18 Q74 18 74 38 M22 38 L78 38 L74 84 L26 84 Z" />,
    accessory: <path {...common} d="M32 46 A18 18 0 1 1 32 46.1 M68 46 A18 18 0 1 1 68 46.1 M50 46 L50 46" />,
    saree: <path {...common} d="M38 10 L54 10 L52 24 Q68 34 62 52 Q72 60 66 88 L34 88 Q30 60 40 52 Q30 34 38 24 Z M52 24 Q60 40 50 58" />,
    kurta: <path {...common} d="M36 20 L44 12 L50 18 L56 12 L64 20 L60 32 L56 28 L58 90 L42 90 L44 28 L40 32 Z" />,
    lehenga: <path {...common} d="M38 14 L62 14 L58 30 Q78 40 82 88 L18 88 Q22 40 42 30 Z M44 30 L56 30" />,
    sherwani: <path {...common} d="M34 18 L50 10 L66 18 L66 32 L60 28 L60 90 L40 90 L40 28 L34 32 Z M50 10 L50 30 M42 40 L58 40 M42 50 L58 50" />,
  };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {paths[category] || paths.top}
    </svg>
  );
}
