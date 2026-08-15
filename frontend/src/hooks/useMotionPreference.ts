import { useEffect, useState } from "react";

// Central place to decide whether "full" motion/3D should run. Combines
// the user's OS-level reduced-motion preference with a simple viewport
// check so expensive scenes never load on phones or for people who've
// asked for less motion.
export function useMotionPreference(): { reduceMotion: boolean; isCompact: boolean; allowRich: boolean } {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setReduceMotion(motionQuery.matches);
      setIsCompact(widthQuery.matches);
    };
    update();

    motionQuery.addEventListener("change", update);
    widthQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      widthQuery.removeEventListener("change", update);
    };
  }, []);

  return { reduceMotion, isCompact, allowRich: !reduceMotion && !isCompact };
}
