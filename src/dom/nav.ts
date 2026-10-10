import { shared } from '../state/store'

let rafId = 0

// Constant-velocity easing with short smooth accel/decel at the ends (a
// trapezoid velocity profile). Unlike ease-in-out, the middle is NOT fast — so
// the scene crossfade, which happens mid-scroll, plays at a steady slow pace.
function trapEase(t: number): number {
  const a = 0.18 // fraction of time spent accelerating / decelerating
  if (t < a) return (t * t) / (2 * a * (1 - a))
  if (t > 1 - a) {
    const u = 1 - t
    return 1 - (u * u) / (2 * a * (1 - a))
  }
  return (t - a / 2) / (1 - a)
}

// Eased scroll with a deliberately unhurried, controllable duration — the
// browser's native smooth-scroll is too quick for the cinematic transitions.
// This is user-initiated navigation, so it animates even under reduced motion
// (the decorative loops are what reduced-motion disables, not this).
function smoothScrollTo(target: number, duration = 4500) {
  const start = window.scrollY || window.pageYOffset || 0
  const end = Math.max(0, Math.round(target))
  const dist = end - start
  cancelAnimationFrame(rafId)
  if (Math.abs(dist) < 2) {
    window.scrollTo(0, end)
    return
  }
  const t0 = performance.now()
  function step(now: number) {
    const k = Math.min(1, (now - t0) / duration)
    window.scrollTo(0, Math.round(start + dist * trapEase(k)))
    if (k < 1) rafId = requestAnimationFrame(step)
  }
  rafId = requestAnimationFrame(step)
}

// Smooth-scroll to the "settled" position of event `i` (title + card in view).
// i >= number of chapters scrolls to the Save-the-dates section.
export function scrollToSlot(i: number) {
  const vh = shared.vh
  const chaps = shared.chapters
  let target: number
  if (i >= 0 && i < chaps.length && chaps[i]) {
    const g = chaps[i]
    target = g.top + 0.42 * (g.height - vh)
  } else if (shared.savedate) {
    target = shared.savedate.top
  } else {
    target = document.documentElement.scrollHeight
  }
  smoothScrollTo(target)
}

// Advance from event `i` to the next event (or the Save-the-dates section).
export function goNextEvent(i: number) {
  scrollToSlot(i + 1)
}
