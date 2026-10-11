// Looping background music. Must be started from a user gesture (the gate tap),
// which is why startMusic() is called from the Enter button's click handler.
let audio: HTMLAudioElement | null = null

export function startMusic() {
  if (!audio) {
    audio = new Audio('/assets/music.mp3')
    audio.loop = true
    audio.volume = 0.5
  }
  audio.muted = false
  audio.play().catch(() => {})
}

/** Toggle mute; returns the new muted state. */
export function toggleMuted(): boolean {
  if (!audio) return false
  audio.muted = !audio.muted
  return audio.muted
}
