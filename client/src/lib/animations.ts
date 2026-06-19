/**
 * animations.ts
 *
 * Single source of truth for all Framer Motion variants.
 * Import from here instead of copy-pasting fadeUpVariant everywhere.
 *
 * Usage:
 *   import { fadeUp, fadeIn, staggerContainer, slideInLeft } from "@/lib/animations";
 *
 *   <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
 */

import type { Variants } from "framer-motion";

// ── Fade up (most common — was copy-pasted 34 times) ─────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Simple fade in ────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ── Slide in from the left ────────────────────────────────────────────────────
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Slide in from the right ───────────────────────────────────────────────────
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Scale up ──────────────────────────────────────────────────────────────────
export const scaleUp: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Stagger container — wrap around a list of animated children ───────────────
// Each child gets a 0.1s delay after the previous one.
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ── Slower stagger for hero sections ─────────────────────────────────────────
export const staggerSlow: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

// ── Card hover ────────────────────────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0,  boxShadow: "0 0 0px rgba(6,182,212,0)" },
  hover: { y: -6, boxShadow: "0 20px 40px rgba(6,182,212,0.15)", transition: { duration: 0.3 } },
};
