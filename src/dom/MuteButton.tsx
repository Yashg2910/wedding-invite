import { useState } from 'react'
import { toggleMuted } from './music'

// Small floating control to mute/unmute the background music.
export default function MuteButton() {
  const [muted, setMuted] = useState(false)
  return (
    <button
      className="mute-btn"
      type="button"
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      onClick={() => setMuted(toggleMuted())}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h3l4-3.5v13L7 15H4z" fill="currentColor" />
          <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h3l4-3.5v13L7 15H4z" fill="currentColor" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </button>
  )
}
