import type { Variants, Transition } from "framer-motion";

// ─── Transitions ────────────────────────────────────────────────────────────

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 18,
};

export const smoothTween: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.5,
};

// ─── Entrance variants ───────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothSpring,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothSpring,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothSpring,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothSpring,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothSpring,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTween,
  },
};

// ─── Container — drives stagger on children ──────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ─── Button interaction ──────────────────────────────────────────────────────

export const buttonHover = {
  scale: 1.04,
};

export const buttonTap = {
  scale: 0.96,
};

export const buttonHoverGlow = (glowColor: string) => ({
  scale: 1.04,
  boxShadow: `0 0 20px ${glowColor}`,
});

// ─── Viewport config (use once so it doesn't re-fire on scroll back) ─────────

export const viewportOnce = { once: true, amount: 0.2 } as const;
