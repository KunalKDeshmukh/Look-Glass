import React from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Star } from "lucide-react";
import GarmentIcon from "./GarmentIcon";
import Tilt3DCard from "./Tilt3DCard";
import { Product } from "../types";

const COLORWAY_HEX: Record<string, string> = { Bone: "#EDEAE2", Ink: "#17161A", Brass: "#B8935A", Violet: "#4C3B73", Maroon: "#6B1E23", Gold: "#C9A227", Emerald: "#1F5C4B", Ivory: "#F4EFE6", Blush: "#D8A8A0", Sage: "#8B9574" };

interface Props {
  product: Product;
  isWishlisted: boolean;
  isInWardrobe: boolean;
  onWishlist: (p: Product) => void;
  onWardrobe: (p: Product) => void;
  onFindSimilar: (p: Product) => void;
}

export default function ProductCard({ product, isWishlisted, isInWardrobe, onWishlist, onWardrobe, onFindSimilar }: Props) {
  return (
    <Tilt3DCard className="animate-riseIn" maxTilt={7}>
    <div className="group relative border border-line/60 bg-panel flex flex-col">
      <div
        className="relative aspect-[4/5] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: (COLORWAY_HEX[product.colorway] || "#4C3B73") + "22" }}
      >
        <Link to={`/product/${product.id}`} className="w-2/3 h-2/3 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <GarmentIcon category={product.category} className="w-full h-full transition-transform duration-500 group-hover:scale-105" strokeWidth={1.2} />
          )}
        </Link>
        <div className="absolute top-2 left-2 font-mono text-[10px] tracking-widest uppercase px-2 py-1 bg-canvas/90 border border-line/70">
          {product.colorway}
        </div>
        <button
          onClick={() => onWishlist(product)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-canvas/90 border border-line/70 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? "#4C3B73" : "none"} stroke={isWishlisted ? "#4C3B73" : "#17161A"} />
        </button>
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${product.id}`} className="font-serif text-[15px] leading-snug text-ink hover:text-violet">
            {product.name}
          </Link>
          <span className="font-mono text-sm text-violet whitespace-nowrap">${product.price}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted">{product.occasion} · {product.category}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Star className="w-3 h-3" fill="#B8935A" stroke="#B8935A" /> {product.rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={() => onWardrobe(product)}
            className={`flex-1 text-xs font-medium py-2 border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${
              isInWardrobe ? "bg-ink text-canvas border-ink" : "border-ink text-ink hover:bg-ink hover:text-canvas"
            }`}
          >
            {isInWardrobe ? "In wardrobe" : "Add to wardrobe"}
          </button>
          <button
            onClick={() => onFindSimilar(product)}
            className="text-xs font-medium py-2 px-2.5 border border-line text-ink hover:border-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
            title="Find similar"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
    </Tilt3DCard>
  );
}
