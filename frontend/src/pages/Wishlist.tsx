import React, { useEffect, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import { listCollection, removeFromCollection } from "../api/collections";
import { orderFromWishlist } from "../api/orders";
import { CollectionItem } from "../types";
import { useToast } from "../context/ToastContext";

export default function Wishlist() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const { notify } = useToast();

  useEffect(() => { listCollection("wishlist").then(({ items }) => setItems(items)); }, []);

  async function remove(item: CollectionItem) {
    await removeFromCollection("wishlist", item.id);
    setItems((i) => i.filter((x) => x.id !== item.id));
  }

  async function order(item: CollectionItem) {
    await orderFromWishlist(item.id);
    setItems((i) => i.filter((x) => x.id !== item.id));
    notify(`Order placed for ${item.name}.`);
  }

  return (
    <div className="py-10">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Wishlist</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink mb-7">Saved for later.</h1>
      <CollectionGrid
        items={items}
        emptyLabel="Your wishlist is empty — tap the heart on any piece to save it here."
        onRemove={remove}
        secondaryAction={{ label: "Order now", onClick: order }}
      />
    </div>
  );
}
