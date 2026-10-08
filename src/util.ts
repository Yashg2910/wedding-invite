// Small math helpers — ported verbatim from the old js/app.js.
export function clamp(v: number, a = 0, b = 1): number {
  return Math.min(b, Math.max(a, v))
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
export function easeIO(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
export function easeIn(t: number): number {
  return t * t * t
}
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
