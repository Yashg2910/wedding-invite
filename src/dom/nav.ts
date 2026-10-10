import { shared } from '../state/store'
import { easeIO, prefersReducedMotion } from '../util'

let rafId = 0

// Eased scroll with a controllable (deliberately unhurried) duration — the
// browser's native smooth-scroll is too quick for the cinematic transitions.
function smoothScrollTo(target: number, duration = 2700) {
  const start = window.scrollY || window.pageYOffset || 0
  const dist = Math.max(0, Math.round(target)) - start
  cancelAnimationFrame(rafId)
  if (Math.abs(dist) < 2 || prefersReducedMotion) {
    window.scrollTo(0, Math.max(0, Math.round(target)))
    return
  }
  const t0 = performance.now()
  function step(now: number) {
    const k = Math.min(1, (now - t0) / duration)
    window.scrollTo(0, Math.round(start + dist * easeIO(k)))
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
