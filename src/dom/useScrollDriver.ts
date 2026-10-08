import { useEffect } from 'react'
import { shared } from '../state/store'

// Native-scroll driver. Writes scrollY into the shared bag on every scroll event
// and caches each section's geometry on mount/resize ONLY — never per frame.
// This is the fix for the original's per-frame getBoundingClientRect layout thrash.
export function useScrollDriver(mode: string) {
  useEffect(() => {
    function measure() {
      const chaps = Array.from(document.querySelectorAll<HTMLElement>('.chapter'))
      shared.chapters = chaps.map((el) => ({ el, top: el.offsetTop, height: el.offsetHeight }))
      const sd = document.querySelector<HTMLElement>('.savedate')
      shared.savedate = sd ? { el: sd, top: sd.offsetTop, height: sd.offsetHeight } : null
      shared.vh = window.innerHeight
      shared.scrollMax = document.documentElement.scrollHeight - window.innerHeight
    }
    function onScroll() {
      shared.scrollY = window.scrollY || window.pageYOffset || 0
    }

    measure()
    onScroll()
    // Re-measure after fonts settle (layout shifts the section heights).
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    // Give the browser a frame to apply the unlocked layout.
    const raf = requestAnimationFrame(measure)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [mode])
}
