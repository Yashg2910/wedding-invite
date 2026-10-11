// Firebase web config. Paste your values from:
//   Firebase console → Project settings → General → Your apps → Web app → "SDK setup and configuration" (Config)
// These values are public by design (safe to commit). Analytics stays OFF until
// `measurementId` (G-XXXXXXXXXX) is filled in, so the site works fine without it.
//
// You can also supply them as Vite env vars (VITE_FB_*) in a .env file or in
// Netlify → Site settings → Environment variables; those take precedence.
const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FB_API_KEY ?? '',
  authDomain: env.VITE_FB_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FB_PROJECT_ID ?? '',
  storageBucket: env.VITE_FB_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FB_SENDER_ID ?? '',
  appId: env.VITE_FB_APP_ID ?? '',
  measurementId: env.VITE_FB_MEASUREMENT_ID ?? '',
}
