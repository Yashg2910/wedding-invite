// Discrete app state (zustand) + a module-level mutable bag for per-frame values.
//
// Hard rule from the plan: per-frame values (scroll, reveal weights, section geometry)
// live in `shared` and are mutated directly inside useFrame / scroll handlers — NEVER
// pushed through React state, which would re-render every frame.
import { create } from 'zustand'
import { initialGreeting } from '../dom/guestName'

export type Mode = 'gate' | 'opening' | 'story'
export type Tier = 0 | 1 | 2 // 0 = low (weak phone), 1 = mid, 2 = high (desktop)

interface AppState {
  mode: Mode
  gateReady: boolean // gate texture has loaded; Enter becomes tappable
  tier: Tier
  greeting: string
  setMode: (m: Mode) => void
  setGateReady: (v: boolean) => void
  setTier: (t: Tier) => void
  setGreeting: (g: string) => void
  enter: () => void
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'gate',
  gateReady: false,
  tier: typeof window !== 'undefined' && Math.min(screen.width, screen.height) < 700 ? 1 : 2,
  greeting: initialGreeting,
  setMode: (mode) => set({ mode }),
  setGateReady: (gateReady) => set({ gateReady }),
  setTier: (tier) => set({ tier }),
  setGreeting: (greeting) => set({ greeting }),
  enter: () => {
    const s = get()
    if (s.mode !== 'gate' || !s.gateReady) return
    shared.entered = true
    shared.phaseT = 0
    set({ mode: 'opening' })
  },
}))

// ---- Per-frame mutable bag (no React involvement) ----
export interface SectionGeom {
  top: number // offsetTop in document space
  height: number // offsetHeight
  el: HTMLElement
}

export const shared = {
  scrollY: 0,
  vh: typeof window !== 'undefined' ? window.innerHeight : 800,
  // cached geometry, recomputed only on resize
  chapters: [] as SectionGeom[],
  savedate: null as SectionGeom | null,
  scrollMax: 0,
  // smoothed per-chapter values (mirrors the old SM.*)
  rev: [0, 0, 0, 0],
  prog: [0, 0, 0, 0],
  x: [0, 0, 0, 0],
  dim: 0,
  // gate opening timeline (seconds since the Enter tap)
  entered: false,
  phaseT: 0,
  // first-chapter reveal is driven by the entry tween, not scroll
  entryReveal: 0,
}
