import React, { useEffect, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import { listCollection, removeFromCollection } from "../api/collections";
import { CollectionItem } from "../types";
import { useToast } from "../context/ToastContext";

export default function Wardrobe() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const { notify } = useToast();

  useEffect(() => { listCollection("wardrobe").then(({ items }) => setItems(items)); }, []);

  async function remove(item: CollectionItem) {
    await removeFromCollection("wardrobe", item.id);
    setItems((i) => i.filter((x) => x.id !== item.id));
    notify(`Removed ${item.name} from your wardrobe.`);
  }

  return (
    <div className="py-10">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Wardrobe</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink mb-7">Your virtual closet.</h1>
      <CollectionGrid items={items} emptyLabel="Nothing saved yet — add pieces from the shop or your Glass edit." onRemove={remove} />
    </div>
  );
}
