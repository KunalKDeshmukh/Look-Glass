import React from "react";
import { motion } from "framer-motion";
import { useMotionPreference } from "../hooks/useMotionPreference";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

// Fades + rises content into view once it crosses the viewport, once,
// via framer-motion's built-in viewport observer (no manual IntersectionObserver
// wiring needed). No-ops to a plain div under prefers-reduced-motion.
export default function ScrollReveal({ children, className = "", delay = 0, y = 24 }: Props) {
  const { reduceMotion } = useMotionPreference();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
