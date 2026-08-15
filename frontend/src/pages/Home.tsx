import React, { Suspense, lazy, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, ScanLine, ShoppingBag, Package } from "lucide-react";
import GarmentIcon from "../components/GarmentIcon";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import ScrollReveal from "../components/ScrollReveal";
import { listProducts } from "../api/products";
import { listCollection, addToCollection, removeFromCollection } from "../api/collections";
import { Product, CollectionItem, StyleProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useMotionPreference } from "../hooks/useMotionPreference";

const Hero3D = lazy(() => import("../components/Hero3D"));

const PROFILE_KEY = "lookglass_style_profile";

export default function Home() {
  const [picks, setPicks] = useState<Product[]>([]);
  const [indianPicks, setIndianPicks] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<CollectionItem[]>([]);
  const [wardrobe, setWardrobe] = useState<CollectionItem[]>([]);
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { allowRich } = useMotionPreference();

  const profile: StyleProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"vibes":[],"colors":[],"occasions":[]}');
  const hasProfile = profile.colors.length || profile.occasions.length || profile.vibes.length;

  useEffect(() => {
    listProducts({ limit: 48 }).then(({ items }) => {
      const filtered = hasProfile
        ? items.filter((p) => profile.colors.includes(p.colorway) || profile.occasions.includes(p.occasion))
        : items;
      setPicks((filtered.length ? filtered : items).slice(0, 4));
      setIndianPicks(items.filter((p) => p.tags.includes("indian")).slice(0, 4));
    });
    if (user) {
      listCollection("wishlist").then(({ items }) => setWishlist(items));
      listCollection("wardrobe").then(({ items }) => setWardrobe(items));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    <div>
      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-6 items-center py-10 md:py-16">
        <div className="animate-riseIn">
          <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">AI Atelier — Vol. 01</div>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] mt-3 text-ink">
            Dressing, translated by an algorithm that actually looks at you.
          </h1>
          <p className="mt-5 text-[#4A4638] text-[15px] leading-relaxed max-w-md">
            Upload a photo, tell the Glass your vibe, and walk away with an edit built for your body, your closet, and your week — not a generic feed.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <Button variant="primary" onClick={() => navigate("/scan")}>
              Step into the Glass <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate("/shop")}>
              Browse the shop
            </Button>
          </div>
        </div>

        {/* HERO: real 3D scene on capable devices, static plate everywhere else */}
        <div className="relative aspect-square border border-line/60 bg-panel flex items-center justify-center overflow-hidden animate-riseIn">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #17161A 0px, #17161A 1px, transparent 1px, transparent 22px)" }} />
          {allowRich ? (
            <Suspense fallback={<GarmentIcon category="dress" className="w-1/2 h-1/2 text-violet" strokeWidth={1} />}>
              <div className="absolute inset-0">
                <Hero3D />
              </div>
            </Suspense>
          ) : (
            <GarmentIcon category="dress" className="w-1/2 h-1/2 text-violet" strokeWidth={1} />
          )}
          <div className="absolute bottom-3 left-3 font-mono text-[10px] tracking-widest uppercase text-muted pointer-events-none">Fig. 01 — the mirror, made intelligent</div>
        </div>
      </section>

      <ScrollReveal>
        <section className="py-10 border-t border-line/50">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">{hasProfile ? "Personalized picks" : "Today's edit"}</div>
              <h2 className="font-serif text-2xl mt-1 text-ink">
                {hasProfile ? "Chosen from your style profile" : "Set a style profile in the Glass for picks tuned to you"}
              </h2>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-violet">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {picks.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlist.some((i) => i.productId === p.id)}
                isInWardrobe={wardrobe.some((i) => i.productId === p.id)}
                onWishlist={toggleWishlist}
                onWardrobe={toggleWardrobe}
                onFindSimilar={(prod) => navigate(`/shop?similarTo=${prod.id}`)}
              />
            ))}
          </div>
        </section>
      </ScrollReveal>

      {indianPicks.length > 0 && (
        <ScrollReveal>
          <section className="py-10 border-t border-line/50">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#C9A227]">The Indian Edit</div>
                <h2 className="font-serif text-2xl mt-1 text-ink">Sarees, kurtas, lehengas & sherwanis for the festive season</h2>
              </div>
              <Link to="/shop?q=indian" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-violet">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {indianPicks.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.some((i) => i.productId === p.id)}
                  isInWardrobe={wardrobe.some((i) => i.productId === p.id)}
                  onWishlist={toggleWishlist}
                  onWardrobe={toggleWardrobe}
                  onFindSimilar={(prod) => navigate(`/shop?similarTo=${prod.id}`)}
                />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <section className="py-10 border-t border-line/50 grid sm:grid-cols-3 gap-6">
          {[
            { Icon: ScanLine, title: "The Glass reads you", body: "A photo and a few taps become outfit logic — not a stock recommendation." },
            { Icon: ShoppingBag, title: "One wardrobe, everywhere", body: "Save pieces from your scan or the shop into a single closet that remembers you." },
            { Icon: Package, title: "No dead ends", body: "Wishlist, order, revisit — every edit has somewhere to go next." },
          ].map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="flex flex-col gap-3">
                <f.Icon className="w-5 h-5 text-violet" />
                <h3 className="font-serif text-lg text-ink">{f.title}</h3>
                <p className="text-sm text-[#4A4638] leading-relaxed">{f.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </section>
      </ScrollReveal>
    </div>
  );
}
