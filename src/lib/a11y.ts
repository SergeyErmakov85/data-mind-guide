import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/**
 * Project-wide reduced motion hook.
 *
 * Returns `true` when the user has `prefers-reduced-motion: reduce` set.
 * Components SHOULD use this to disable transforms / scale / translate
 * animations and collapse durations to 0.
 */
export const usePrefersReducedMotion = (): boolean => {
  return Boolean(useFramerReducedMotion());
};

/**
 * Helper that returns framer-motion `transition` props honouring the
 * reduced-motion preference. Falls back to `{ duration: 0 }` when reduced.
 */
export const motionTransition = (
  reduced: boolean,
  base: Record<string, unknown> = { duration: 0.4, ease: 'easeOut' }
) => (reduced ? { duration: 0 } : base);

/**
 * Helper to neutralise translate/scale variants when reduced motion is on.
 * Pass a variants object; when reduced, all animated entries become identity.
 */
export const motionVariants = <T extends Record<string, any>>(
  reduced: boolean,
  variants: T
): T => {
  if (!reduced) return variants;
  const out: Record<string, any> = {};
  for (const k of Object.keys(variants)) {
    const v = variants[k];
    if (v && typeof v === 'object') {
      out[k] = { ...v, x: 0, y: 0, scale: 1, rotate: 0, transition: { duration: 0 } };
    } else {
      out[k] = v;
    }
  }
  return out as T;
};
