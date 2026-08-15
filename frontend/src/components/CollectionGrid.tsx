import React from "react";
import { Trash2 } from "lucide-react";
import GarmentIcon from "./GarmentIcon";
import { CollectionItem } from "../types";

const COLORWAY_HEX: Record<string, string> = { Bone: "#EDEAE2", Ink: "#17161A", Brass: "#B8935A", Violet: "#4C3B73", Maroon: "#6B1E23", Gold: "#C9A227", Emerald: "#1F5C4B", Ivory: "#F4EFE6", Blush: "#D8A8A0", Sage: "#8B9574" };

interface Props {
  items: CollectionItem[];
  emptyLabel: string;
  onRemove: (item: CollectionItem) => void;
  secondaryAction?: { label: string; onClick: (item: CollectionItem) => void };
}

export default function CollectionGrid({ items, emptyLabel, onRemove, secondaryAction }: Props) {
  if (!items.length) {
    return <div className="border border-dashed border-line py-16 text-center text-sm text-muted">{emptyLabel}</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="border border-line/60 bg-panel flex flex-col animate-riseIn">
          <div className="relative aspect-[4/5] flex items-center justify-center" style={{ backgroundColor: (COLORWAY_HEX[item.colorway] || "#4C3B73") + "22" }}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-2/3 h-2/3 object-contain" loading="lazy" />
            ) : (
              <GarmentIcon category={item.category} className="w-2/3 h-2/3" strokeWidth={1.2} />
            )}
            <button
              onClick={() => onRemove(item)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-canvas/90 border border-line/70 flex items-center justify-center hover:border-[#8B3A3A] hover:text-[#8B3A3A]"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3.5 flex flex-col gap-1.5">
            <h3 className="font-serif text-[15px] text-ink leading-snug">{item.name}</h3>
            <div className="font-mono text-[10px] tracking-wider uppercase text-muted">{item.colorway} · {item.category}</div>
            {item.price != null && <div className="font-mono text-sm text-violet">${item.price}</div>}
            {secondaryAction && (
              <button
                onClick={() => secondaryAction.onClick(item)}
                className="mt-2 text-xs font-medium py-2 border border-ink text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
