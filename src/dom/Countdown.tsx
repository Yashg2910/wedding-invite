import { useEffect, useRef } from 'react'
import { WEDDING_DATE } from '../config'
import { prefersReducedMotion } from '../util'

// Ported from the countdown half of initExtras (app.js:611-622).
const CELLS = [
  { key: 'd', label: 'days', div: 864e5, mod: 0 },
  { key: 'h', label: 'hours', div: 36e5, mod: 24 },
  { key: 'm', label: 'minutes', div: 6e4, mod: 60 },
  { key: 's', label: 'seconds', div: 1e3, mod: 60 },
] as const

export default function Countdown({ live }: { live: boolean }) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  const prev = useRef<Record<string, string>>({})

  useEffect(() => {
    function setCell(key: string, v: number) {
      const str = String(v).padStart(2, '0')
      if (prev.current[key] === str) return
      prev.current[key] = str
      const el = refs.current[key]
      if (!el) return
      const sp = document.createElement('span')
      sp.textContent = str
      if (!prefersReducedMotion) sp.className = 'flip'
      el.replaceChildren(sp)
    }
    function tick() {
      const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now())
      setCell('d', Math.floor(diff / 864e5))
      setCell('h', Math.floor(diff / 36e5) % 24)
      setCell('m', Math.floor(diff / 6e4) % 60)
      setCell('s', Math.floor(diff / 1e3) % 60)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={'count' + (live ? ' live' : '')} aria-live="off">
      {CELLS.map((c) => (
        <div className="unit" key={c.key}>
          <div className="digits" ref={(el) => (refs.current[c.key] = el)}>
            <span>00</span>
          </div>
          <small>{c.label}</small>
        </div>
      ))}
    </div>
  )
}
