/**
 * Reveal.tsx — Scroll-reveal primitives for the whole site.
 *
 * Goals: smooth, cohesive, and cheap to render on mobile.
 *  - Animates ONLY opacity + transform (GPU-composited, no layout thrash).
 *  - Fires once per element (no re-trigger jank while scrolling back up).
 *  - Honors prefers-reduced-motion: falls back to a plain fade, no movement.
 *
 * Usage:
 *   <Reveal>...</Reveal>                      // single element
 *   <Reveal direction="left" delay={0.1}>…</Reveal>
 *   <Stagger className="grid …">              // grid / list of children
 *     <StaggerChild>…</StaggerChild>
 *     <StaggerChild>…</StaggerChild>
 *   </Stagger>
 */
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { REVEAL_VIEWPORT, SMOOTH_EASE } from "@/lib/animations";

type Direction = "up" | "down" | "left" | "right" | "none";

const axis: Record<Direction, "x" | "y" | null> = {
  up: "y",
  down: "y",
  left: "x",
  right: "x",
  none: null,
};
const sign: Record<Direction, number> = { up: 1, down: -1, left: 1, right: -1, none: 0 };

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  distance?: number;
  duration?: number;
  amount?: number;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { children, className, direction = "up", delay = 0, distance = 28, duration = 0.7, amount },
  ref,
) {
  const reduce = useReducedMotion();
  const a = axis[direction];

  const hidden = reduce || !a ? { opacity: 0 } : { opacity: 0, [a]: sign[direction] * distance };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...REVEAL_VIEWPORT, ...(amount != null ? { amount } : {}) }}
      variants={{
        hidden,
        visible: { opacity: 1, x: 0, y: 0, transition: { duration, ease: SMOOTH_EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
});

interface StaggerProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  amount?: number;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(function Stagger(
  { children, className, gap = 0.09, amount },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...REVEAL_VIEWPORT, ...(amount != null ? { amount } : {}) }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap, delayChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
});

interface StaggerChildProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

export const StaggerChild = forwardRef<HTMLDivElement, StaggerChildProps>(function StaggerChild(
  { children, className, distance = 28 },
  ref,
) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SMOOTH_EASE } },
  };
  return (
    <motion.div ref={ref} className={className} variants={variants}>
      {children}
    </motion.div>
  );
});
