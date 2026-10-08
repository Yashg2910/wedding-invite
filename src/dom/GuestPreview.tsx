import { useState } from 'react'
import { useStore } from '../state/store'
import { cleanName, greeting, urlStyle } from './guestName'

// Guest-name preview control — only mounted when the URL has ?preview.
export default function GuestPreview() {
  const [editing, setEditing] = useState(false)
  const setGreeting = useStore((s) => s.setGreeting)

  return (
    <div className={'proto' + (editing ? ' editing' : '')}>
      <input
        type="text"
        placeholder="e.g. Manoj Gupta"
        aria-label="Guest name to preview"
        maxLength={60}
        onChange={(e) => setGreeting(greeting(cleanName(e.target.value), urlStyle))}
      />
      <button type="button" onClick={() => setEditing((v) => !v)}>
        {editing ? 'Done' : 'Preview a guest name'}
      </button>
    </div>
  )
}
