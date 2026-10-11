// Invite category from the URL path, so a different link = a different guest set
// without looking like a separate site.
//   /td/...  -> two-day (all events) — also the default when no code is present
//   /od/...  -> one-day (day-2 events only: Baraat & Phere, Reception)
export type Category = 'oneday' | 'twoday'

const seg =
  typeof location !== 'undefined'
    ? (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
    : ''

export const category: Category = seg === 'od' ? 'oneday' : 'twoday'

// Events that happen on day 2 — shown in both categories.
const DAY2 = new Set(['phere', 'reception'])

/** Whether an event (by key) is shown for the current category. */
export function isEventActive(key: string): boolean {
  return category === 'twoday' || DAY2.has(key)
}
