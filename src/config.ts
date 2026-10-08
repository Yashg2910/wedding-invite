// Everything you are likely to edit lives here (ported from the old js/config.js).

export interface InviteConfig {
  /** Countdown target (ISO date with the IST offset). This is a SAMPLE date: replace it. */
  weddingDate: string
  /**
   * Your family surname. '' shows "Our families welcome you to the wedding of".
   * 'Sharma' shows "The Sharma family welcomes you to the wedding of".
   */
  hostFamily: string
  /** Image layers. *_size is [width, height] in px and must match the files. */
  assets: Record<string, string | [number, number]>
}

export const CONFIG: InviteConfig = {
  // Countdown target: Haldi (first celebration), 10 Dec 11:30 AM IST.
  // Confirm the YEAR — carried over from the previous sample (2026).
  weddingDate: '2026-12-10T11:30:00+05:30',

  hostFamily: '',

  assets: {
    gate: 'assets/gate.webp',
    haldi_bg: 'assets/haldi_bg.webp',
    haldi_fg: 'assets/haldi_fg.webp',
    sangeet_bg: 'assets/sangeet_bg.webp',
    sangeet_fg: 'assets/sangeet_fg.webp',
    phere_bg: 'assets/phere_bg.webp',
    phere_fg: 'assets/phere_fg.webp',
    reception_bg: 'assets/reception_bg.webp',
    reception_fg: 'assets/reception_fg.webp',
    haldi_size: [900, 1200],
    sangeet_size: [900, 939],
    phere_size: [900, 1200],
    reception_size: [900, 1601],
  },
}

export const A = CONFIG.assets
export const WEDDING_DATE = new Date(CONFIG.weddingDate)

/** Base path for a public asset ('assets/x.webp' -> '/assets/x.webp'). */
export function asset(key: string): string {
  const v = A[key]
  return '/' + String(v)
}
export function size(key: string): [number, number] {
  return A[key + '_size'] as [number, number]
}
