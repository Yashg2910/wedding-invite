import type { CSSProperties } from 'react'

export interface ChapterData {
  ev: number
  title: string
  long?: boolean
  hi: string
  lede: string
  date: string
  time: string
  venue: string
  style: CSSProperties
}

const VENUE = 'TCL, Bypass, Indore'

export const CHAPTERS: ChapterData[] = [
  {
    ev: 0,
    title: 'Haldi',
    hi: 'हल्दी',
    lede: 'Turmeric, marigolds and a lot of laughter to begin the celebrations.',
    date: '10 December',
    time: '11:30 AM',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#5a1e0a',
      ['--ts' as string]: '0 0 14px rgba(255,246,214,.95), 0 0 2px rgba(255,246,214,.9)',
      ['--scrim-top' as string]: 'rgba(255,244,210,.55)',
    },
  },
  {
    ev: 1,
    title: 'Sangeet',
    hi: 'संगीत',
    lede: 'An evening of music, dhol and dancing under the lights.',
    date: '10 December',
    time: '8:00 PM onwards',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#fff',
      ['--ts' as string]: '0 0 6px #ff8fe0, 0 0 20px #ff3fb4, 0 0 44px #a83cff',
      ['--scrim-top' as string]: 'rgba(12,8,40,.65)',
    },
  },
  {
    ev: 2,
    title: 'Baraat & Phere',
    long: true,
    hi: 'बारात और फेरे',
    lede: 'The baraat arrives, and seven rounds around the sacred fire.',
    date: '11 December',
    time: '1:00 PM onwards',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#5a1414',
      ['--ts' as string]: '0 0 14px rgba(255,248,240,.95), 0 0 2px rgba(255,248,240,.9)',
      ['--scrim-top' as string]: 'rgba(255,246,240,.6)',
    },
  },
  {
    ev: 3,
    title: 'Reception',
    hi: 'स्वागत समारोह',
    lede: 'Dinner, blessings and a night to celebrate together.',
    date: '11 December',
    time: '8:00 PM onwards',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#ffe3a0',
      ['--ts' as string]: '0 0 18px rgba(255,190,90,.7), 0 2px 8px rgba(0,0,0,.7)',
      ['--scrim-top' as string]: 'rgba(20,10,30,.6)',
    },
  },
]

export const DATE_ROWS = [
  { label: 'Haldi', value: '10 December · 11:30 AM' },
  { label: 'Sangeet', value: '10 December · 8:00 PM' },
  { label: 'Baraat & Phere', value: '11 December · 1:00 PM' },
  { label: 'Reception', value: '11 December · 8:00 PM' },
]

export function OrnSVG() {
  return (
    <svg className="orn" viewBox="0 0 200 20" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".85">
        <path d="M6 10 C40 10 58 4 86 9 C92 10 95 11 98 10" />
        <path d="M194 10 C160 10 142 4 114 9 C108 10 105 11 102 10" />
        <path d="M100 3 L105 10 L100 17 L95 10 Z" fill="currentColor" />
      </g>
    </svg>
  )
}
