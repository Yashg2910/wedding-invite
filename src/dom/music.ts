// Looping background music. Must be started from a user gesture (the gate tap),
// which is why startMusic() is called from the Enter button's click handler.
//
// Playback is tied to page visibility: when the tab is backgrounded or the app
// is closed/minimised the track pauses, and it resumes when the user comes back
// — but only if they had started it and haven't manually muted it. This keeps
// the music to "only while viewing the invite".
let audio: HTMLAudioElement | null = null
let started = false // user tapped Enter — music is allowed to play
let muted = false // user explicitly muted via the mute button

function ensureAudio() {
  if (!audio) {
    audio = new Audio('/assets/music.mp3')
    audio.loop = true
    audio.volume = 0.5
  }
  return audio
}

export function startMusic() {
  const a = ensureAudio()
  started = true
  a.muted = false
  muted = false
  // only actually play if the page is currently visible
  if (document.visibilityState === 'visible') {
    a.play().catch(() => {})
  }
}

/** Toggle mute; returns the new muted state. */
export function toggleMuted(): boolean {
  const a = ensureAudio()
  muted = !muted
  a.muted = muted
  return muted
}

// Pause when the app/tab is hidden, resume when it's visible again.
function handleVisibility() {
  if (!audio || !started) return
  if (document.visibilityState === 'hidden') {
    audio.pause()
  } else if (!muted) {
    audio.play().catch(() => {})
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibility)
  // pagehide covers mobile Safari / app close where visibilitychange is unreliable
  window.addEventListener('pagehide', () => {
    if (audio) audio.pause()
  })
}
