import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import Scene from './three/Scene'
import { D } from './three/events'
import { qualityFor } from './three/quality'
import { useStore, type Tier } from './state/store'
import { useScrollDriver } from './dom/useScrollDriver'
import { scrollToSlot } from './dom/nav'
import { hasPreview, hasGuest, urlStyle, guestSlug } from './dom/guestName'
import { category } from './category'
import { initAnalytics, track } from './analytics'
import GateOverlay from './dom/GateOverlay'
import GuestPreview from './dom/GuestPreview'
import Story from './dom/Story'
import MuteButton from './dom/MuteButton'

// Adapt resolution to sustained framerate. A decline steps the quality tier down
// once (never up, to avoid oscillation); AdaptiveDpr scales DPR within the tier.
function PerfManager() {
  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          const t = useStore.getState().tier
          if (t > 0) useStore.getState().setTier((t - 1) as Tier)
        }}
      />
      <AdaptiveDpr pixelated={false} />
    </>
  )
}

export default function App() {
  const mode = useStore((s) => s.mode)
  const tier = useStore((s) => s.tier)
  const q = qualityFor(tier)

  const beckonRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const threadBeadRef = useRef<HTMLElement>(null)

  useScrollDriver(mode)

  // Analytics: fire once on load with who/which-invite context.
  useEffect(() => {
    initAnalytics(
      {
        invite_category: category,
        has_guest: hasGuest,
        style: urlStyle ?? 'default',
        guest_id: guestSlug || '(none)',
      },
      guestSlug || undefined,
    )
    track('invite_open', {
      invite_category: category,
      has_guest: hasGuest,
      guest_id: guestSlug || '(none)',
    })
  }, [])

  useEffect(() => {
    if (mode === 'story') {
      document.documentElement.classList.remove('locked')
      window.scrollTo(0, 0)
      // Bring the first event's card + CTA in promptly after entry (quick glide).
      const t = setTimeout(() => scrollToSlot(0, 1200), 600)
      return () => clearTimeout(t)
    }
  }, [mode])

  return (
    <>
      <Canvas
        className="gl-canvas"
        aria-hidden="true"
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={q.dpr}
        camera={{ fov: 35, near: 0.05, far: 60, position: [0, 0, D] }}
        frameloop="always"
      >
        <PerfManager />
        <Scene beckonRef={beckonRef} flashRef={flashRef} threadBeadRef={threadBeadRef} />
      </Canvas>

      {hasPreview && mode === 'gate' && <GuestPreview />}
      <div className="flash" ref={flashRef} />
      <div className={'thread' + (mode === 'story' ? ' on' : '')} aria-hidden="true">
        <i ref={threadBeadRef} />
      </div>
      <GateOverlay beckonRef={beckonRef} />
      {mode === 'story' && <MuteButton />}
      <Story />
    </>
  )
}
