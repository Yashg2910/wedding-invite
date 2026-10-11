import { useEffect, useState } from 'react'
import { useStore } from '../state/store'
import { hostLine } from './guestName'
import HandSVG from './HandSVG'
import { startMusic } from './music'

export default function GateOverlay({ beckonRef }: { beckonRef: React.RefObject<HTMLDivElement> }) {
  const mode = useStore((s) => s.mode)
  const gateReady = useStore((s) => s.gateReady)
  const enter = useStore((s) => s.enter)
  const greeting = useStore((s) => s.greeting)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (mode === 'story') {
      const t = setTimeout(() => setGone(true), 900)
      return () => clearTimeout(t)
    }
  }, [mode])

  if (gone) return null

  const cls =
    'gate-ui' +
    (gateReady ? ' ready' : '') +
    (mode === 'opening' ? ' opening' : '') +
    (mode === 'story' ? ' gone' : '')

  return (
    <div className={cls}>
      <div className="gtext">
        <p className="ganesh" lang="hi">॥ श्री गणेशाय नमः ॥</p>
        <p className="invitee">{greeting}</p>
        <p className="host">{hostLine}</p>
        <p className="couple gold-text">Yash &amp; Isha</p>
        <svg className="flourish" viewBox="0 0 260 24" aria-hidden="true">
          <g fill="none" stroke="#e2b964" strokeWidth="1.1" strokeLinecap="round">
            <path d="M8 12 C48 12 70 4 104 10 C114 12 118 14 124 12" />
            <path d="M252 12 C212 12 190 4 156 10 C146 12 142 14 136 12" />
            <path d="M130 4 L136 12 L130 20 L124 12 Z" fill="#e2b964" />
            <circle cx="112" cy="12" r="1.6" fill="#e2b964" />
            <circle cx="148" cy="12" r="1.6" fill="#e2b964" />
          </g>
        </svg>
      </div>
      <div className="beckon" ref={beckonRef} aria-hidden="true">
        <span className="halo"></span>
        <div className="rot">
          <HandSVG />
        </div>
      </div>
      <button
        className="enter"
        type="button"
        aria-label="Tap to open the doors of Rajwada"
        onClick={() => {
          startMusic()
          enter()
        }}
      ></button>
    </div>
  )
}
