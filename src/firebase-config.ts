// Firebase web config. These values are public by design (safe to commit).
// Env vars (VITE_FB_* in a .env or Netlify) override the defaults below.
// Analytics stays off until `measurementId` (G-XXXXXXXXXX) is present.
const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FB_API_KEY ?? 'AIzaSyDZxHCFYV6-0P67nzRfHj2ptxwr00Z8q-8',
  authDomain: env.VITE_FB_AUTH_DOMAIN ?? 'yash-isha-wedding-invite.firebaseapp.com',
  projectId: env.VITE_FB_PROJECT_ID ?? 'yash-isha-wedding-invite',
  storageBucket: env.VITE_FB_STORAGE_BUCKET ?? 'yash-isha-wedding-invite.firebasestorage.app',
  messagingSenderId: env.VITE_FB_SENDER_ID ?? '1060094959670',
  appId: env.VITE_FB_APP_ID ?? '1:1060094959670:web:01638e88c9d3ae2e0fb897',
  measurementId: env.VITE_FB_MEASUREMENT_ID ?? 'G-2W8BYKPCDN',
}
