// Firebase Analytics — lazy-loaded and fully optional. Everything no-ops (and
// events queue briefly) until a valid config with a measurementId is present,
// so the site is unaffected when analytics isn't configured.
import { firebaseConfig } from './firebase-config'

type Params = Record<string, unknown>

/* eslint-disable @typescript-eslint/no-explicit-any */
let log: ((...args: any[]) => void) | null = null
let instance: any = null
let started = false
const queue: Array<[string, Params | undefined]> = []

// Analytics only runs on the real invite domain — never on localhost, Vercel
// preview URLs (*.vercel.app), or any other host. Hardcoded on purpose.
const ANALYTICS_HOST = 'invite.ishayash.life'

export async function initAnalytics(userProps?: Params, userId?: string) {
  if (started) return
  started = true
  if (typeof location === 'undefined' || location.hostname !== ANALYTICS_HOST) return
  if (!firebaseConfig.measurementId || !firebaseConfig.apiKey) return
  try {
    const [{ initializeApp }, am] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ])
    if (!(await am.isSupported())) return
    const app = initializeApp(firebaseConfig)
    instance = am.getAnalytics(app)
    log = am.logEvent as any
    if (userId) am.setUserId(instance, userId)
    if (userProps) am.setUserProperties(instance, userProps as any)
    for (const [e, p] of queue.splice(0)) log!(instance, e, p)
  } catch {
    /* analytics must never break the site */
  }
}

export function track(event: string, params?: Params) {
  if (log && instance) {
    try {
      log(instance, event, params)
    } catch {
      /* ignore */
    }
  } else if (started && queue.length < 50) {
    queue.push([event, params])
  }
}
