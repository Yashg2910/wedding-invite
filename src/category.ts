// Invite category from the URL path, so a different link = a different guest set
// without looking like a separate site.
//   /td/...   -> two-day  (all events) — also the default when no code is present
//   /od/...   -> one-day  (day-2 events only: Baraat & Phere, Reception)
//   /btd/...  -> bride two-day (all events + Mayra, a bride-side ceremony before Phere)
//   /bod/...  -> bride one-day (day-2 events only: Mayra, Baraat & Phere, Reception)
//
// "Bride" invites add the Mayra ceremony; everything else is identical. The bride
// flag and the day-length are kept separate so event gating stays simple.
export type Category = 'oneday' | 'twoday' | 'bride-oneday' | 'bride-twoday'

const seg =
  typeof location !== 'undefined'
    ? (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
    : ''

export const category: Category =
  seg === 'bod'
    ? 'bride-oneday'
    : seg === 'btd'
      ? 'bride-twoday'
      : seg === 'od'
        ? 'oneday'
        : 'twoday'

/** Whether this invite shows the full two-day event set (vs day-2 only). */
export const isTwoDay = category === 'twoday' || category === 'bride-twoday'

/** Whether this is a bride-side invite (adds the Mayra ceremony). */
export const isBride = category === 'bride-oneday' || category === 'bride-twoday'

// Events that happen on day 2 — shown in both one-day and two-day categories.
// Mayra (bride-side) is on day 2, right before Baraat & Phere.
const DAY2 = new Set(['mayra', 'phere', 'reception'])

// Events that only appear on bride-side invites.
const BRIDE_ONLY = new Set(['mayra'])

/** Whether an event (by key) is shown for the current category. */
export function isEventActive(key: string): boolean {
  if (BRIDE_ONLY.has(key) && !isBride) return false
  return isTwoDay || DAY2.has(key)
}
