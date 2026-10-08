// Guest-name handling — ported verbatim from the old js/app.js (lines 15-41).
import { CONFIG } from '../config'

export function cleanName(raw: string | null): string {
  if (!raw) return ''
  let s = String(raw).replace(/[-_+]+/g, ' ')
  try {
    s = s.replace(/[^\p{L}\p{M}\s.]/gu, '')
  } catch {
    s = s.replace(/[^A-Za-z\s.]/g, '')
  }
  s = s.replace(/\s+/g, ' ').trim().slice(0, 60)
  return s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase() + w.slice(1) : ''))
    .join(' ')
}

export function greeting(name: string, style: string | null): string {
  if (!name) return 'Dear Family & Friends'
  if (style === 'friend') return 'Dear ' + name
  return 'Shri ' + name + ' ji & Parivar'
}

const params = new URLSearchParams(location.search)

export const urlStyle = params.get('style')
export const hasPreview = params.has('preview')
export const initialGreeting = greeting(cleanName(params.get('to')), urlStyle)
export const hostLine = CONFIG.hostFamily
  ? 'The ' + CONFIG.hostFamily + ' family welcomes you to the wedding of'
  : 'Our families welcome you to the wedding of'
