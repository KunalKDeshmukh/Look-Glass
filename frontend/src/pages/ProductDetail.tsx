import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, Star, ArrowLeft } from "lucide-react";
import GarmentIcon from "../components/GarmentIcon";
import ProductCard from "../components/ProductCard";
import { getProduct, getSimilar, getReviews, postReview } from "../api/products";
import { listCollection, addToCollection, removeFromCollection } from "../api/collections";
import { Product, Review, CollectionItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../api/client";

const COLORWAY_HEX: Record<string, string> = { Bone: "#EDEAE2", Ink: "#17161A", Brass: "#B8935A", Violet: "#4C3B73", Maroon: "#6B1E23", Gold: "#C9A227", Emerald: "#1F5C4B", Ivory: "#F4EFE6", Blush: "#D8A8A0", Sage: "#8B9574" };

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<CollectionItem[]>([]);
  const [wardrobe, setWardrobe] = useState<CollectionItem[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getProduct(id).then(({ product }) => setProduct(product));
    getSimilar(id).then(({ items }) => setSimilar(items));
    getReviews(id).then(({ items }) => setReviews(items));
    if (user) {
      listCollection("wishlist").then(({ items }) => setWishlist(items));
      listCollection("wardrobe").then(({ items }) => setWardrobe(items));
    }
  }, [id, user]);

  if (!product) return <div className="py-20 text-center text-sm text-muted">Loading…</div>;

  const isWishlisted = wishlist.some((i) => i.productId === product.id);
  const isInWardrobe = wardrobe.some((i) => i.productId === product.id);

  async function toggleWishlist() {
    if (!user) return navigate("/login");
    const existing = wishlist.find((i) => i.productId === product!.id);
    if (existing) {
      await removeFromCollection("wishlist", existing.id);
      setWishlist((w) => w.filter((i) => i.id !== existing.id));
    } else {
      const { item } = await addToCollection("wishlist", { productId: product!.id, name: product!.name, category: product!.category, price: product!.price, colorway: product!.colorway, occasion: product!.occasion, source: "catalog", image: product!.image });
      setWishlist((w) => [...w, item]);
      notify(`Saved ${product!.name} to your wishlist.`);
    }
  }

  async function toggleWardrobe() {
    if (!user) return navigate("/login");
    const existing = wardrobe.find((i) => i.productId === product!.id);
    if (existing) {
      await removeFromCollection("wardrobe", existing.id);
      setWardrobe((w) => w.filter((i) => i.id !== existing.id));
    } else {
      const { item } = await addToCollection("wardrobe", { productId: product!.id, name: product!.name, category: product!.category, price: product!.price, colorway: product!.colorway, occasion: product!.occasion, source: "catalog", image: product!.image });
      setWardrobe((w) => [...w, item]);
      notify(`Added ${product!.name} to your wardrobe.`);
    }
  }

  async function toggleWishlistFor(p: Product) {
    if (!user) return navigate("/login");
    const existing = wishlist.find((i) => i.productId === p.id);
    if (existing) {
      await removeFromCollection("wishlist", existing.id);
      setWishlist((w) => w.filter((i) => i.id !== existing.id));
    } else {
      const { item } = await addToCollection("wishlist", { productId: p.id, name: p.name, category: p.category, price: p.price, colorway: p.colorway, occasion: p.occasion, source: "catalog", image: p.image });
      setWishlist((w) => [...w, item]);
      notify(`Saved ${p.name} to your wishlist.`);
    }
  }

  async function toggleWardrobeFor(p: Product) {
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

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate("/login");
    setReviewError("");
    try {
      const { review } = await postReview(product!.id, rating, comment);
      setReviews((r) => [review, ...r]);
      setComment("");
      notify("Review posted — thank you.");
    } catch (err) {
      setReviewError(extractErrorMessage(err, "Couldn't post that review."));
    }
  }

  return (
    <div className="py-10">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-[4/5] border border-line/60 bg-panel flex items-center justify-center" style={{ backgroundColor: (COLORWAY_HEX[product.colorway] || "#4C3B73") + "22" }}>
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-2/3 h-2/3 object-contain" />
          ) : (
            <GarmentIcon category={product.category} className="w-2/3 h-2/3" strokeWidth={1} />
          )}
          <button onClick={toggleWishlist} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-canvas/90 border border-line/70 flex items-center justify-center">
            <Heart className="w-5 h-5" fill={isWishlisted ? "#4C3B73" : "none"} stroke={isWishlisted ? "#4C3B73" : "#17161A"} />
          </button>
        </div>

        <div>
          <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">{product.occasion} · {product.colorway}</div>
          <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-4 h-4" fill="#B8935A" stroke="#B8935A" />
            <span className="text-sm text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted">({product.reviewCount} reviews)</span>
          </div>
          <p className="mt-4 text-[#4A4638] leading-relaxed">{product.description}</p>
          <div className="font-mono text-2xl text-violet mt-6">${product.price}</div>
          <div className="flex flex-wrap gap-2 mt-4">
            {product.tags.map((t) => (
              <span key={t} className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 border border-line/60 text-muted">{t}</span>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-3">
            <button onClick={toggleWardrobe} className={`flex-1 text-sm font-medium py-3 border transition-colors ${isInWardrobe ? "bg-ink text-canvas border-ink" : "border-ink text-ink hover:bg-ink hover:text-canvas"}`}>
              {isInWardrobe ? "In wardrobe" : "Add to wardrobe"}
            </button>
            <button onClick={toggleWishlist} className={`text-sm font-medium py-3 px-4 border transition-colors ${isWishlisted ? "bg-violet text-canvas border-violet" : "border-line text-ink hover:border-ink"}`}>
              Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-16 border-t border-line/50 pt-8 max-w-2xl">
        <h2 className="font-serif text-2xl text-ink mb-5">Reviews</h2>
        <form onSubmit={submitReview} className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} title={`${n} stars`}>
                <Star className="w-5 h-5" fill={n <= rating ? "#B8935A" : "none"} stroke="#B8935A" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={user ? "Share your take on fit, fabric, sizing…" : "Sign in to leave a review"}
            disabled={!user}
            className="px-3 py-2.5 bg-panel border border-line/60 text-sm min-h-[80px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet disabled:opacity-50"
          />
          {reviewError && <p className="text-sm text-[#8B3A3A]">{reviewError}</p>}
          <button type="submit" disabled={!user} className="self-start bg-ink text-canvas px-4 py-2.5 text-sm font-medium hover:bg-violet disabled:opacity-40 transition-colors">
            Post review
          </button>
        </form>
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-line/40 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-ink">{r.userName}</span>
                <span className="inline-flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3" fill="#B8935A" stroke="#B8935A" />)}</span>
              </div>
              <p className="text-sm text-[#4A4638] mt-1.5">{r.comment}</p>
            </div>
          ))}
          {!reviews.length && <p className="text-sm text-muted">No reviews yet — be the first.</p>}
        </div>
      </section>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="mt-16 border-t border-line/50 pt-8">
          <h2 className="font-serif text-2xl text-ink mb-5">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlist.some((i) => i.productId === p.id)}
                isInWardrobe={wardrobe.some((i) => i.productId === p.id)}
                onWishlist={toggleWishlistFor}
                onWardrobe={toggleWardrobeFor}
                onFindSimilar={(prod) => navigate(`/product/${prod.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
