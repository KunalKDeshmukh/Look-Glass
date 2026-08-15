import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMotionPreference } from "../hooks/useMotionPreference";

interface Props {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

// Wraps any card in a pointer-tracked 3D tilt with a spring return and a
// matching elevation shadow. Falls back to a plain, motionless wrapper
// for touch devices and prefers-reduced-motion, since tilt-on-hover has
// no equivalent (and no value) on a touchscreen.
export default function Tilt3DCard({ children, className = "", maxTilt = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { allowRich } = useMotionPreference();

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const shadowOpacity = useTransform(springY, [0, 0.5, 1], [0.18, 0.08, 0.18]);
  const boxShadow = useTransform(shadowOpacity, (v) => `0 18px 30px -12px rgba(23,22,26,${v})`);

  if (!allowRich) {
    return <div className={className}>{children}</div>;
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      <motion.div style={{ boxShadow }}>{children}</motion.div>
    </motion.div>
  );
}
