import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useMotionPreference } from "../hooks/useMotionPreference";

interface Props extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

const BASE = "inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANTS: Record<string, string> = {
  primary: "bg-ink text-canvas px-5 py-3 hover:bg-violet",
  secondary: "border border-ink text-ink px-5 py-3 hover:bg-ink hover:text-canvas",
  ghost: "text-ink px-3 py-2 underline underline-offset-4 decoration-line hover:decoration-ink",
};

export default function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  const { allowRich } = useMotionPreference();

  return (
    <motion.button
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      whileHover={allowRich ? { y: -2, boxShadow: variant === "primary" ? "0 10px 24px -8px rgba(76,59,115,0.45)" : "0 8px 20px -10px rgba(23,22,26,0.25)" } : undefined}
      whileTap={allowRich ? { y: 0, scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
