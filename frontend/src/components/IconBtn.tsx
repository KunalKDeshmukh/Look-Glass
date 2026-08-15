import React from "react";
import { motion } from "framer-motion";
import { useMotionPreference } from "../hooks/useMotionPreference";

interface Props {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}

export default function IconBtn({ onClick, active, title, children }: Props) {
  const { allowRich } = useMotionPreference();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileHover={allowRich ? { y: -1, boxShadow: "0 6px 14px -8px rgba(23,22,26,0.35)" } : undefined}
      whileTap={allowRich ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
        active ? "bg-violet border-violet text-canvas" : "bg-canvas border-line text-ink hover:border-ink"
      }`}
    >
      {children}
    </motion.button>
  );
}
