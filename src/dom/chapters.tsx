import type { CSSProperties } from 'react'
import { isEventActive } from '../category'

export interface ChapterData {
  ev: number
  key: string
  title: string
  long?: boolean
  hi: string
  lede: string
  date: string
  time: string
  venue: string
  style: CSSProperties
}

const VENUE = 'The Chandra Leela (TCL), Indore'

const ALL_CHAPTERS: ChapterData[] = [
  {
    ev: 0,
    key: 'haldi',
    title: 'Haldi',
    hi: 'हल्दी',
    lede: 'Turmeric, marigolds and a lot of laughter to begin the celebrations.',
    date: '10 December',
    time: '11:30 AM',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#fff3d4',
      ['--title-stroke' as string]: '1.3px #2a0202',
      ['--ts' as string]:
        '0 0 6px #ff7a6a, 0 0 15px #e01208, 0 0 30px #b00000, 0 0 52px #8a0000, 0 0 10px rgba(30,2,2,.75)',
      ['--scrim-top' as string]: 'rgba(255,244,210,.55)',
      ['--sub-shift' as string]: '-8svh',
    },
  },
  {
    ev: 1,
    key: 'sangeet',
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
      ['--head-shift' as string]: '13svh',
    },
  },
  {
    ev: 2,
    key: 'phere',
    title: 'Baraat & Phere',
    long: true,
    hi: 'बारात और फेरे',
    lede: 'The baraat arrives, and seven rounds around the sacred fire.',
    date: '11 December',
    time: '1:00 PM onwards',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#fff0e6',
      ['--title-stroke' as string]: '1.3px #2a0604',
      ['--ts' as string]:
        '0 0 6px #ff7a5a, 0 0 15px #d61a0c, 0 0 30px #a60800, 0 0 52px #800020, 0 0 10px rgba(30,6,4,.75)',
      ['--scrim-top' as string]: 'rgba(255,246,240,.6)',
    },
  },
  {
    ev: 3,
    key: 'reception',
    title: 'Reception',
    hi: 'स्वागत समारोह',
    lede: 'Dinner, blessings and a night to celebrate together.',
    date: '11 December',
    time: '8:00 PM onwards',
    venue: VENUE,
    style: {
      ['--tc' as string]: '#fff2e0',
      ['--title-stroke' as string]: '1.3px #2a0010',
      ['--ts' as string]:
        '0 0 6px #ff6a8a, 0 0 15px #c8102e, 0 0 30px #8a0020, 0 0 52px #5a0014, 0 0 10px rgba(25,0,10,.8)',
      ['--scrim-top' as string]: 'rgba(20,10,30,.6)',
      ['--sub-shift' as string]: '15svh',
    },
  },
]

// Only the events active for the current invite category (see src/category.ts).
export const CHAPTERS: ChapterData[] = ALL_CHAPTERS.filter((c) => isEventActive(c.key))

const ALL_DATE_ROWS = [
  { key: 'haldi', label: 'Haldi', value: '10 December · 11:30 AM' },
  { key: 'sangeet', label: 'Sangeet', value: '10 December · 8:00 PM' },
  { key: 'phere', label: 'Baraat & Phere', value: '11 December · 1:00 PM' },
  { key: 'reception', label: 'Reception', value: '11 December · 8:00 PM' },
]
export const DATE_ROWS = ALL_DATE_ROWS.filter((d) => isEventActive(d.key))

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
