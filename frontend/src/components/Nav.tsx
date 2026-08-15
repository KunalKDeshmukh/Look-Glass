import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Package, User as UserIcon, LogOut } from "lucide-react";
import IconBtn from "./IconBtn";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/scan", label: "The Glass" },
  { to: "/shop", label: "Shop" },
  { to: "/wardrobe", label: "Wardrobe" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/orders", label: "Orders" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "bg-canvas/75 backdrop-blur-xl border-line/60 shadow-[0_1px_0_0_rgba(23,22,26,0.04)]" : "bg-canvas/40 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <NavLink to="/" className="font-serif text-xl tracking-tight text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet">
          LOOKGLASS
        </NavLink>
        <nav className="hidden md:flex items-center gap-1 relative">
          {LINKS.map((l) => {
            const isActive = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={`relative px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${
                  isActive ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-violet"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <IconBtn onClick={() => navigate("/wishlist")} title="Wishlist">
            <Heart className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={() => navigate("/wardrobe")} title="Wardrobe">
            <ShoppingBag className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={() => navigate("/orders")} title="Orders">
            <Package className="w-4 h-4" />
          </IconBtn>
          {user ? (
            <IconBtn onClick={logout} title={`Sign out (${user.name})`}>
              <LogOut className="w-4 h-4" />
            </IconBtn>
          ) : (
            <IconBtn onClick={() => navigate("/login")} title="Sign in">
              <UserIcon className="w-4 h-4" />
            </IconBtn>
          )}
        </div>
      </div>
      <nav className="md:hidden flex overflow-x-auto gap-1 px-5 pb-3 -mt-1">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm whitespace-nowrap font-medium ${isActive ? "text-ink underline underline-offset-4 decoration-violet" : "text-muted"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
