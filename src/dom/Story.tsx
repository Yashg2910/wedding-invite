import { useEffect } from 'react'
import { CHAPTERS, OrnSVG } from './chapters'
// import ScratchCard from './ScratchCard' // temporarily hidden
import Blessings from './Blessings'
import Countdown from './Countdown'
import HandSVG from './HandSVG'
import { useStore } from '../state/store'
import { goNextEvent } from './nav'
import { track } from '../analytics'

function Chapter({ data, index, isLast }: { data: (typeof CHAPTERS)[number]; index: number; isLast: boolean }) {
  return (
    <section className="chapter" data-ev={index} data-key={data.key} style={data.style}>
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
                track(isLast ? 'save_dates_click' : 'next_event', { from: data.key, index })
                goNextEvent(index)
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

  // Fire one event_view per screen the first time it comes into view.
  // We observe each chapter's sticky .pin (and the .savedate section) rather
  // than the tall .chapter wrapper: the .pin is exactly one viewport tall and
  // holds the event's title + text, so "the Haldi screen is showing" maps
  // directly to "the Haldi pin is in view".
  useEffect(() => {
    if (mode !== 'story') return
    const seen = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.6) continue
          const host = e.target as HTMLElement
          // .pin lives inside .chapter[data-key]; .savedate has its own key.
          const k =
            host.dataset.key ||
            host.closest<HTMLElement>('[data-key]')?.dataset.key ||
            'savedate'
          if (!seen.has(k)) {
            seen.add(k)
            track('event_view', { event: k })
          }
        }
      },
      { threshold: [0.6] },
    )
    document.querySelectorAll('.chapter .pin, .savedate').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [mode])

  return (
    <main className={'story' + (mode === 'story' ? ' on' : '')}>
      <Blessings />

      {CHAPTERS.map((c, i) => (
        <Chapter key={c.ev} data={c} index={i} isLast={i === CHAPTERS.length - 1} />
      ))}

      <section className="savedate" data-key="savedate">
        <img className="savedate-logo" src="/assets/logo_light.webp" alt="Yash & Isha" width={378} height={508} />
        <Countdown live />
        <div className="little-request">
          <p className="little-request-title">A Little Request ❤️</p>
          <p className="little-request-quote">“Mele chachu ki shaadi me zalool zalool aana.”</p>
          <p className="little-request-by">— Tiya Gupta</p>
        </div>
        {/* Scratch card temporarily hidden
        <p className="lede">Scratch the gold card to reveal the dates.</p>
        <ScratchCard onReveal={() => {}} />
        */}
        <div className="map-card">
          <div className="map-frame">
            <iframe
              className="map-embed"
              title="Venue — Hotel The Chandra Leela (TCL), Indore"
              src="https://maps.google.com/maps?q=22.7549305,75.9337149&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="map-click"
              href="https://maps.app.goo.gl/99nxBbFuwnzsH4gd8"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Hotel The Chandra Leela (TCL), Indore in Google Maps"
              onClick={() => track('map_open', { source: 'map' })}
            />
            <div className="map-top">
              <b>Hotel The Chandra Leela (TCL)</b>
              <a
                href="https://maps.app.goo.gl/99nxBbFuwnzsH4gd8"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('map_open', { source: 'link' })}
              >
                View larger map ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
