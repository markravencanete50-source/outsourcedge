/**
 * animations.ts — Single source of truth for all Framer Motion variants.
 *
 * BEFORE: fadeUpVariant, scaleVariant, containerVariants were copy-pasted
 * into every single page (About, Careers, Home, Services, Contact, etc.)
 *
 * AFTER: Import from here. One change affects every page.
 *
 * Usage:
 *   import { fadeUpVariant, scaleVariant, containerVariants } from "@/lib/animations";
 */

import type { Variants } from "framer-motion";

// ── Shared easing ─────────────────────────────────────────────────────────────
// easeOutExpo-style curve — long, smooth deceleration. The whole site uses this
// so motion feels like one system, not a pile of one-off transitions.
export const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

// Default viewport config for scroll reveals: fire once, a little before the
// element is fully on screen, so content is already settling as it enters.
export const REVEAL_VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" } as const;

// ── Reveal variants (used by <Reveal> / <Stagger>) ────────────────────────────
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SMOOTH_EASE } },
};

// Reduced-motion-safe fallback: fade only, no movement.
export const revealUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// Matches the exact definition used across all your pages
export const fadeUpVariant: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export const scaleVariant: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

// Used in Contact.tsx (slightly different timing)
export const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

// Used in Services.tsx
export const fastContainerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const fastItemVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
