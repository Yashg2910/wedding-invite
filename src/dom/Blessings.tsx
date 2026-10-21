import { GROOM, BRIDE, grandparents } from './familyBlessings'
import { showBrideBlessings } from '../category'
import HandSVG from './HandSVG'
import { scrollToSlot } from './nav'
import { track } from '../analytics'

// Ganesha emblem (gold line-art on transparent) that crowns the blessings
// screen — matches the brass/gold palette used across the site.
function GaneshaEmblem() {
  return (
    <img
      className="ganesha-emblem"
      src="/assets/ganesha.png"
      alt="Lord Ganesha"
      width={438}
      height={569}
    />
  )
}

function Flourish() {
  return (
    <svg className="flourish" viewBox="0 0 260 24" aria-hidden="true">
      <g fill="none" stroke="#e2b964" strokeWidth="1.1" strokeLinecap="round">
        <path d="M8 12 C48 12 70 4 104 10 C114 12 118 14 124 12" />
        <path d="M252 12 C212 12 190 4 156 10 C146 12 142 14 136 12" />
        <path d="M130 4 L136 12 L130 20 L124 12 Z" fill="#e2b964" />
        <circle cx="112" cy="12" r="1.6" fill="#e2b964" />
        <circle cx="148" cy="12" r="1.6" fill="#e2b964" />
      </g>
    </svg>
  )
}

function CoupleBlock({ name, relation, mother, father }: { name: string; relation: string; mother: string; father: string }) {
  return (
    <div className="blessings-couple">
      <p className="blessings-name gold-text">{name}</p>
      <p className="blessings-parents">
        {relation} {mother} &amp; {father}
      </p>
    </div>
  )
}

export default function Blessings() {
  const groom = <CoupleBlock name={GROOM.name} relation="S/o" mother={GROOM.mother} father={GROOM.father} />
  const bride = <CoupleBlock name={BRIDE.name} relation="D/o" mother={BRIDE.mother} father={BRIDE.father} />

  // Bride-facing invites (btd / bod / od) lead with the bride; otherwise the groom.
  const first = showBrideBlessings ? bride : groom
  const second = showBrideBlessings ? groom : bride

  return (
    <section className="blessings" data-key="blessings">
      <div className="blessings-inner">
        <GaneshaEmblem />
        <p className="ganesh" lang="hi">॥ श्री गणेशाय नमः ॥</p>

        <p className="blessings-head">With the blessings of</p>
        <p className="blessings-grandparents">{grandparents}</p>

        <Flourish />

        {first}

        <p className="blessings-amp" aria-hidden="true">&amp;</p>

        {second}

        <div className="next-cue blessings-cue">
          <button
            className="next-btn"
            type="button"
            onClick={(e) => {
              e.currentTarget.animate(
                [
                  { transform: 'scale(1)', filter: 'brightness(1)' },
                  { transform: 'scale(.9)', filter: 'brightness(1.18)', offset: 0.35 },
                  { transform: 'scale(1.05)', filter: 'brightness(1.1)', offset: 0.7 },
                  { transform: 'scale(1)', filter: 'brightness(1)' },
                ],
                { duration: 340, easing: 'ease-out' },
              )
              track('next_event', { from: 'blessings', index: -1 })
              scrollToSlot(0)
            }}
          >
            View events <span className="arr" aria-hidden="true">↓</span>
          </button>
          <div className="next-hand" aria-hidden="true">
            <HandSVG />
          </div>
        </div>
      </div>
    </section>
  )
}
