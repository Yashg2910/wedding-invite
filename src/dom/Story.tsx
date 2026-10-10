import { useState } from 'react'
import { CHAPTERS, OrnSVG } from './chapters'
import ScratchCard from './ScratchCard'
import Countdown from './Countdown'
import { useStore } from '../state/store'

function Chapter({ data }: { data: (typeof CHAPTERS)[number] }) {
  return (
    <section className="chapter" data-ev={data.ev} style={data.style}>
      <div className="pin">
        <header>
          <h2 className={'title' + (data.long ? ' long' : '')}>{data.title}</h2>
          <OrnSVG />
          <p className="hi" lang="hi">
            {data.hi}
          </p>
          <p className="lede">{data.lede}</p>
        </header>
        <div className="card">
          <dl className="details">
            <dt>Date</dt>
            <dd>{data.date}</dd>
            <dt>Time</dt>
            <dd>{data.time}</dd>
            <dt>Venue</dt>
            <dd>{data.venue}</dd>
          </dl>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span className="sh-label">Scroll</span>
          <svg viewBox="0 0 24 14" fill="none" aria-hidden="true">
            <path d="M2 2 L12 11 L22 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default function Story() {
  const mode = useStore((s) => s.mode)
  const [revealed, setRevealed] = useState(false)

  return (
    <main className={'story' + (mode === 'story' ? ' on' : '')}>
      {CHAPTERS.map((c) => (
        <Chapter key={c.ev} data={c} />
      ))}

      <section className="savedate">
        <h2 className="gold-text">Save the dates</h2>
        <p className="lede">Scratch the gold card to reveal them.</p>
        <ScratchCard onReveal={() => setRevealed(true)} />
        <Countdown live={revealed} />
        <p className="sample">Counting down to the celebrations in Indore.</p>
      </section>
      <footer className="next">
        <p>RSVP comes next.</p>
      </footer>
    </main>
  )
}
