import type { CSSProperties } from 'react'

export interface ChapterData {
  ev: number
  title: string
  long?: boolean
  hi: string
  lede: string
  dress: string
  style: CSSProperties
}

export const CHAPTERS: ChapterData[] = [
  {
    ev: 0,
    title: 'Haldi',
    hi: 'हल्दी',
    lede: 'Turmeric, marigolds and a lot of laughter to begin the celebrations.',
    dress: 'shades of yellow',
    style: {
      ['--tc' as string]: '#5a1e0a',
      ['--ts' as string]: '0 0 14px rgba(255,246,214,.95), 0 0 2px rgba(255,246,214,.9)',
      ['--scrim-top' as string]: 'linear-gradient(rgba(255,244,210,.55), transparent)',
    },
  },
  {
    ev: 1,
    title: 'Sangeet',
    hi: 'संगीत',
    lede: 'An evening of music, dhol and dancing under the lights.',
    dress: 'black, white and sparkle',
    style: {
      ['--tc' as string]: '#fff',
      ['--ts' as string]: '0 0 6px #ff8fe0, 0 0 20px #ff3fb4, 0 0 44px #a83cff',
      ['--scrim-top' as string]: 'linear-gradient(rgba(12,8,40,.65), transparent)',
    },
  },
  {
    ev: 2,
    title: 'Baraat & Phere',
    long: true,
    hi: 'बारात और फेरे',
    lede: 'The baraat arrives, and seven rounds around the sacred fire.',
    dress: 'traditional',
    style: {
      ['--tc' as string]: '#5a1414',
      ['--ts' as string]: '0 0 14px rgba(255,248,240,.95), 0 0 2px rgba(255,248,240,.9)',
      ['--scrim-top' as string]: 'linear-gradient(rgba(255,246,240,.6), transparent)',
    },
  },
  {
    ev: 3,
    title: 'Reception',
    hi: 'स्वागत समारोह',
    lede: 'Dinner, blessings and a night to celebrate together.',
    dress: 'evening formal',
    style: {
      ['--tc' as string]: '#ffe3a0',
      ['--ts' as string]: '0 0 18px rgba(255,190,90,.7), 0 2px 8px rgba(0,0,0,.7)',
      ['--scrim-top' as string]: 'linear-gradient(rgba(20,10,30,.6), transparent)',
    },
  },
]

export const DATE_ROWS = [
  { label: 'Haldi', value: 'date to be added' },
  { label: 'Sangeet', value: 'date to be added' },
  { label: 'Baraat & Phere', value: 'date to be added' },
  { label: 'Reception', value: 'date to be added' },
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
