import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import GarmentIcon from "../components/GarmentIcon";
import { listOrders } from "../api/orders";
import { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { listOrders().then(({ items }) => setOrders(items)); }, []);

  return (
    <div className="py-10">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Orders</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink mb-7">Order history.</h1>
      {!orders.length && <div className="border border-dashed border-line py-16 text-center text-sm text-muted">No orders yet — items you order from your wishlist land here.</div>}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="border border-line/60 bg-panel p-4 animate-riseIn">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="font-mono text-[10px] tracking-wider uppercase text-muted">
                {new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3A6B4C]">
                  <Check className="w-3.5 h-3.5" /> Confirmed
                </span>
                <span className="font-mono text-sm text-ink">${o.total}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {o.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 pr-3 border-r border-line/40 last:border-none">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="w-7 h-7 object-contain" />
                  ) : (
                    <GarmentIcon category={it.category} className="w-7 h-7 text-violet" />
                  )}
                  <span className="font-serif text-sm text-ink">{it.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
