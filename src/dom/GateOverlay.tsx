import { useEffect, useState } from 'react'
import { useStore } from '../state/store'
import { hostLine } from './guestName'

function HandSVG() {
  return (
    <svg viewBox="0 0 200 330">
      <defs>
        <linearGradient id="skX" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f3c7a3" /><stop offset=".45" stopColor="#e4ad86" /><stop offset="1" stopColor="#bf7f57" />
        </linearGradient>
        <linearGradient id="skY" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eebd98" /><stop offset=".7" stopColor="#d69a72" /><stop offset="1" stopColor="#a86a45" />
        </linearGradient>
        <linearGradient id="skHand" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f0c19c" /><stop offset=".55" stopColor="#dfa47c" /><stop offset="1" stopColor="#b87650" />
        </linearGradient>
        <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff0b8" /><stop offset=".45" stopColor="#e2b14a" /><stop offset="1" stopColor="#9c6b1c" />
        </linearGradient>
        <linearGradient id="red" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e5534a" /><stop offset=".5" stopColor="#b3261e" /><stop offset="1" stopColor="#6e1410" />
        </linearGradient>
        <radialGradient id="nail" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff3ec" /><stop offset="1" stopColor="#e9bfae" />
        </radialGradient>
      </defs>
      <g stroke="#6e3e24" strokeWidth="1.3" strokeLinejoin="round">
        <path fill="url(#skHand)" d="M75 146 C72 178 70 208 72 238 C74 262 79 282 82 330 L150 330 C151 300 156 262 163 224 C168 200 172 184 170 168 C166 157 152 150 134 146 L104 140 Z" />
        <path fill="url(#skY)" d="M152 154 C155 146 168 147 171 156 C173 166 172 177 167 184 C162 190 153 188 151 181 C150 172 150 162 152 154 Z" />
        <path fill="url(#skY)" d="M129 142 C133 133 150 133 154 143 C157 155 156 169 151 179 C147 187 134 187 130 178 C128 166 128 153 129 142 Z" />
        <path fill="url(#skY)" d="M104 133 C108 124 126 123 131 132 C135 146 135 163 131 175 C127 184 111 184 107 175 C104 161 103 146 104 133 Z" />
        <path fill="url(#skX)" stroke="none" d="M76 146 C75 112 76 72 78 32 C79 14 85 6 90.5 6 C96 6 101.5 13 102.5 30 C103.5 70 104.5 108 105.5 146 C99 150 83 151 76 146 Z" />
        <path fill="none" d="M76 146 C75 112 76 72 78 32 C79 14 85 6 90.5 6 C96 6 101.5 13 102.5 30 C103.5 70 104.5 108 105.5 140" />
        <path fill="url(#skX)" stroke="none" d="M74 250 C64 224 64 202 72 188 C79 176 92 170 103 171 C112 172 115 181 110 188 C104 195 95 199 91 208 C86 220 87 236 86 254 C82 256 77 255 74 250 Z" />
        <path fill="none" d="M74 250 C64 224 64 202 72 188 C79 176 92 170 103 171 C112 172 115 181 110 188 C104 195 95 199 91 208 C86 220 87 234 86.5 244" />
      </g>
      <ellipse cx="90.5" cy="23" rx="8" ry="12.5" fill="url(#nail)" stroke="#b9887a" strokeWidth=".8" />
      <path d="M86 16 q3 -4 7 -3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
      <ellipse cx="102" cy="178" rx="7.5" ry="5" transform="rotate(-18 102 178)" fill="url(#nail)" stroke="#b9887a" strokeWidth=".8" />
      <g fill="none" stroke="#8a5234" strokeWidth="1" strokeLinecap="round" opacity=".75">
        <path d="M82 58 q8.5 -3 17 0" /><path d="M81.5 62 q9 -2.5 18 0" />
        <path d="M80 97 q10 -4 21 0" /><path d="M80 101 q10 -3 21 0" />
        <path d="M110 164 q10 4 19 0" /><path d="M133 167 q9 3.5 17 0" /><path d="M153 172 q7 3 14 0" />
        <path d="M77 205 q7 -7 15 -6" />
      </g>
      <g fill="#fff" opacity=".28">
        <ellipse cx="88" cy="140" rx="9" ry="4" /><ellipse cx="117" cy="131" rx="8" ry="3.5" />
        <ellipse cx="141" cy="141" rx="7" ry="3" /><ellipse cx="161" cy="154" rx="5.5" ry="2.5" />
        <path d="M82 40 C81 70 81 100 82 130" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path d="M77 113 C86 117.5 96 117.5 105 113" fill="none" stroke="url(#gold)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="91" cy="116.2" r="2.6" fill="#d6283a" stroke="#7a1012" strokeWidth=".6" />
      <g fill="none" stroke="#7d2a12" strokeWidth="1.05" strokeLinecap="round" opacity=".9">
        <path d="M80 72 q10.5 3 22 0" /><path d="M80.5 76.5 q10.5 3 21.5 0" />
        <path d="M85 84 l5.5 5 l5.5 -5" />
        <path d="M79 126 q12 4 25 0" />
        <circle cx="118" cy="214" r="15" /><circle cx="118" cy="214" r="9.5" />
        <path d="M118 199 q5 -9 0 -15 q-5 6 0 15 M118 229 q5 9 0 15 q-5 -6 0 -15 M103 214 q-9 5 -15 0 q6 -5 15 0 M133 214 q9 5 15 0 q-6 -5 -15 0" />
        <path d="M107.4 203.4 q-2 -8 -8 -8 q0 6 8 8 M128.6 203.4 q2 -8 8 -8 q0 6 -8 8 M107.4 224.6 q-2 8 -8 8 q0 -6 8 -8 M128.6 224.6 q2 8 8 8 q0 -6 -8 -8" />
        <path d="M100 246 q18 8 36 0 M104 256 q14 6 28 0" />
        <path d="M124 176 q6 8 4 18 M146 184 q-4 10 -12 16" />
      </g>
      <g fill="#7d2a12" opacity=".9">
        <circle cx="118" cy="214" r="3" />
        <circle cx="90.5" cy="92" r="1.3" /><circle cx="90.5" cy="45" r="1.1" /><circle cx="90.5" cy="50" r="1.1" />
        <circle cx="112" cy="238" r="1.2" /><circle cx="118" cy="239" r="1.2" /><circle cx="124" cy="238" r="1.2" />
      </g>
      <g strokeLinecap="round" fill="none">
        <path d="M81 285 C101 294 131 294 151 285" stroke="url(#gold)" strokeWidth="5.5" />
        <path d="M81 293 C101 302 131 302 151 293" stroke="url(#red)" strokeWidth="5" />
        <path d="M81 300.5 C101 309.5 131 309.5 151 300.5" stroke="url(#gold)" strokeWidth="4" />
        <path d="M81 307.5 C101 316.5 131 316.5 151 307.5" stroke="url(#red)" strokeWidth="5" />
        <path d="M81 315 C101 324 131 324 151 315" stroke="url(#gold)" strokeWidth="5.5" />
      </g>
      <g fill="#fff6d2" opacity=".85"><circle cx="100" cy="289" r="1.2" /><circle cx="116" cy="290.6" r="1.2" /><circle cx="132" cy="289" r="1.2" /><circle cx="108" cy="319.5" r="1.1" /><circle cx="124" cy="319.5" r="1.1" /></g>
    </svg>
  )
}

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
      <button className="enter" type="button" aria-label="Tap to open the doors of Rajwada" onClick={enter}></button>
    </div>
  )
}
