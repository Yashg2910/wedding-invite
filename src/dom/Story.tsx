import { useState } from 'react'
import { CHAPTERS, OrnSVG } from './chapters'
import ScratchCard from './ScratchCard'
import Countdown from './Countdown'
import HandSVG from './HandSVG'
import { useStore } from '../state/store'
import { goNextEvent } from './nav'

function Chapter({ data }: { data: (typeof CHAPTERS)[number] }) {
  const isLast = data.ev === CHAPTERS.length - 1
  return (
    <section className="chapter" data-ev={data.ev} style={data.style}>
      <div className="pin">
        <header>
          <h2 className={'title' + (data.long ? ' long' : '')}>{data.title}</h2>
          <OrnSVG />
          <div className="subhead">
            <p className="hi" lang="hi">
              {data.hi}
            </p>
            <p className="lede">{data.lede}</p>
          </div>
        </header>
        <div className="pin-bottom">
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
          <div className="next-cue">
            <button
              className="next-btn"
              type="button"
              onClick={(e) => {
                // Explicit tap feedback: a quick press-pop + brightness flash.
                e.currentTarget.animate(
                  [
                    { transform: 'scale(1)', filter: 'brightness(1)' },
                    { transform: 'scale(.9)', filter: 'brightness(1.18)', offset: 0.35 },
                    { transform: 'scale(1.05)', filter: 'brightness(1.1)', offset: 0.7 },
                    { transform: 'scale(1)', filter: 'brightness(1)' },
                  ],
                  { duration: 340, easing: 'ease-out' },
                )
                goNextEvent(data.ev)
              }}
            >
              {isLast ? 'Save the dates' : 'Next event'} <span className="arr" aria-hidden="true">↓</span>
            </button>
            <div className="next-hand" aria-hidden="true">
              <HandSVG />
            </div>
          </div>
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
