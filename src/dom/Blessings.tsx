import { GROOM, BRIDE } from './familyBlessings'
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

function CoupleBlock({ name, relation, grandRelation, grandparents, mother, father }: { name: string; relation: string; grandRelation?: string; grandparents?: string; mother: string; father: string }) {
  return (
    <div className="blessings-couple">
      <p className="blessings-name gold-text">{name}</p>
      {grandparents && <p className="blessings-grandparents">{grandRelation} {grandparents}</p>}
      <p className="blessings-parents">
        {relation} {mother} &amp; CA. {father}
      </p>
    </div>
  )
}

export default function Blessings() {
  const lead = showBrideBlessings ? BRIDE : GROOM
  const other = showBrideBlessings ? GROOM : BRIDE

  // Groom is always "S/o"; bride is always "D/o" — independent of display order.
  const relationFor = (p: typeof GROOM) => (p === GROOM ? 'S/o' : 'D/o')
  const grandRelationFor = (p: typeof GROOM) => (p === GROOM ? 'Grand S/o' : 'Grand D/o')

  // Lead person: grandparents line sits at the top (above the invite sentence),
  // so it is omitted from the lead block itself. The second person keeps their
  // grandparents line in-block (above their parents), prefixed with their
  // grand-relation (Grand S/o for the groom, Grand D/o for the bride).
  const first = <CoupleBlock name={lead.name} relation={relationFor(lead)} mother={lead.mother} father={lead.father} />
  const second = <CoupleBlock name={other.name} relation={relationFor(other)} grandRelation={grandRelationFor(other)} grandparents={other.grandparents} mother={other.mother} father={other.father} />

  // The invite line references the lead person: a bride-side invite blesses
  // their "grand daughter", a groom-side invite their "grand son".
  const grandChild = showBrideBlessings ? 'grand daughter' : 'grand son'

  return (
    <section className="blessings" data-key="blessings">
      <div className="blessings-inner">
        <GaneshaEmblem />
        <p className="ganesh" lang="hi">॥ श्री गणेशाय नमः ॥</p>

        <p className="blessings-grandparents">{lead.grandparents}</p>

        <p className="blessings-head">
          Take great pleasure in inviting you to bless the wedding ceremony of their beloved {grandChild}
        </p>

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
