import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Pill from "../components/Pill";
import { listProducts, getSimilar } from "../api/products";
import { listCollection, addToCollection, removeFromCollection } from "../api/collections";
import { Product, CollectionItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["all", "dress", "top", "jacket", "bottoms", "shoes", "bag", "accessory", "saree", "kurta", "lehenga", "sherwani"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [similarTo, setSimilarTo] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<CollectionItem[]>([]);
  const [wardrobe, setWardrobe] = useState<CollectionItem[]>([]);
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      listCollection("wishlist").then(({ items }) => setWishlist(items));
      listCollection("wardrobe").then(({ items }) => setWardrobe(items));
    }
  }, [user]);

  useEffect(() => {
    const similarToId = params.get("similarTo");
    if (similarToId) {
      getSimilar(similarToId).then(({ items }) => setResults(items));
      import("../api/products").then(({ getProduct }) => getProduct(similarToId).then(({ product }) => setSimilarTo(product)));
      return;
    }
    setSimilarTo(null);
    listProducts({ search: query, category, page, limit: 12 }).then(({ items, totalPages }) => {
      setResults(items);
      setTotalPages(totalPages);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, page, params]);

  function clearSimilar() {
    setSimilarTo(null);
    setParams({});
  }

  async function toggleWishlist(p: Product) {
    if (!user) return navigate("/login");
    const existing = wishlist.find((i) => i.productId === p.id);
    if (existing) {
      await removeFromCollection("wishlist", existing.id);
      setWishlist((w) => w.filter((i) => i.id !== existing.id));
      notify(`Removed ${p.name} from your wishlist.`);
    } else {
      const { item } = await addToCollection("wishlist", { productId: p.id, name: p.name, category: p.category, price: p.price, colorway: p.colorway, occasion: p.occasion, source: "catalog", image: p.image });
      setWishlist((w) => [...w, item]);
      notify(`Saved ${p.name} to your wishlist.`);
    }
  }

  async function toggleWardrobe(p: Product) {
    if (!user) return navigate("/login");
    const existing = wardrobe.find((i) => i.productId === p.id);
    if (existing) {
      await removeFromCollection("wardrobe", existing.id);
      setWardrobe((w) => w.filter((i) => i.id !== existing.id));
    } else {
      const { item } = await addToCollection("wardrobe", { productId: p.id, name: p.name, category: p.category, price: p.price, colorway: p.colorway, occasion: p.occasion, source: "catalog", image: p.image });
      setWardrobe((w) => [...w, item]);
      notify(`Added ${p.name} to your wardrobe.`);
    }
  }

  return (
    <div className="py-10">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">Shop</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink">The full edit.</h1>

      {similarTo ? (
        <div className="mt-5 flex items-center gap-3 border border-violet/40 bg-violet/[0.06] px-4 py-2.5 w-fit">
          <span className="text-sm text-ink">Similar to <strong className="font-medium">{similarTo.name}</strong></span>
          <button onClick={clearSimilar} className="text-violet hover:text-ink" title="Clear filter">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by name, color, tag…"
              className="w-full pl-9 pr-3 py-2.5 bg-panel border border-line/60 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet placeholder:text-muted"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Pill key={c} active={category === c} onClick={() => { setCategory(c); setPage(1); }}>{c === "all" ? "All" : c}</Pill>
            ))}
          </div>
        </div>
      )}

      {!similarTo && (
        <div className="mt-3">
          <Pill active={query.toLowerCase() === "indian"} onClick={() => { setQuery(query.toLowerCase() === "indian" ? "" : "indian"); setCategory("all"); setPage(1); }}>
            ✦ The Indian Edit
          </Pill>
        </div>
      )}

      <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isWishlisted={wishlist.some((i) => i.productId === p.id)}
            isInWardrobe={wardrobe.some((i) => i.productId === p.id)}
            onWishlist={toggleWishlist}
            onWardrobe={toggleWardrobe}
            onFindSimilar={(prod) => setParams({ similarTo: prod.id })}
          />
        ))}
        {results.length === 0 && <p className="col-span-full text-sm text-muted py-10 text-center">Nothing matches that search yet.</p>}
      </div>

      {!similarTo && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 text-sm font-mono border ${page === n ? "bg-ink text-canvas border-ink" : "border-line text-ink hover:border-ink"}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
