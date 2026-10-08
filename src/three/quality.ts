// Tier -> concrete quality knobs. Smoothness-first: weaker devices drop the most
// expensive effects. Desktop (tier 2) stays identical to the original look.
import type { Tier } from '../state/store'
import { prefersReducedMotion } from '../util'

export interface Quality {
  dpr: [number, number] // adaptive DPR range for <Canvas>
  particleCount: number
  extras: boolean // additive sprites (beams, firelight, chandeliers, sun)
  gateBlur: boolean // precomputed-blur backdrop behind the gate
  drift: number // ambient camera/pointer drift (0 = off for reduced motion)
}

export function qualityFor(tier: Tier): Quality {
  const drift = prefersReducedMotion ? 0 : 1
  const rm = prefersReducedMotion
  switch (tier) {
    case 0: // weak phone / after perf regression
      return { dpr: [0.8, 1.2], particleCount: rm ? 40 : 110, extras: false, gateBlur: false, drift }
    case 1: // mobile
      return { dpr: [1, 1.6], particleCount: rm ? 60 : 230, extras: true, gateBlur: true, drift }
    default: // desktop — reference look
      return { dpr: [1, 2], particleCount: rm ? 60 : 380, extras: true, gateBlur: true, drift }
  }
}
