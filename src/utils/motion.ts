import type { Transition, Variants } from 'framer-motion'

/**
 * Apple / Linear style snappy spring physics
 * stiffness: 350, damping: 28 (~180-220ms response with subtle micro-rebound)
 */
export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
  mass: 0.8,
}

export const microSpring: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 26,
  mass: 0.6,
}

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
}

/**
 * Stagger container for views, columns, cards, and table rows
 */
export const createStaggerContainer = (
  staggerChildren = 0.035,
  delayChildren = 0.02
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const staggerContainer: Variants = createStaggerContainer(0.035, 0.02)

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: snappySpring,
  },
}

export const staggerRow: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: snappySpring,
  },
}

/**
 * Drawer slide-in and backdrop variants with spring dynamics
 */
export const drawerBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
}

export const drawerPanelVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: snappySpring,
  },
  exit: {
    x: '100%',
    transition: { type: 'spring', stiffness: 400, damping: 35 },
  },
}

/**
 * Accordion cascade for internal drawer sections
 */
export const drawerAccordionContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
}

export const drawerAccordionItem: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: snappySpring,
  },
}

/**
 * Modal scale-in (0.92 -> 1.0) with snappy spring physics
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
}

export const modalCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: snappySpring,
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

/**
 * Checkbox spring pop animation
 * Uses elastic bounce curve compatible with multi-keyframe animations
 */
export const checkboxPopVariants: Variants = {
  unchecked: { scale: 1, rotate: 0 },
  checked: {
    scale: [1, 1.22, 1],
    rotate: [0, -6, 0],
    transition: {
      duration: 0.28,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
}
