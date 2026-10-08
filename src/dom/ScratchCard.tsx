import { useEffect, useRef } from 'react'
import { DATE_ROWS } from './chapters'

// Ported from the scratch-card half of initExtras (app.js:565-609).
// Perf: the 2D context is created with willReadFrequently, and the full-canvas
// getImageData check is throttled (every 8 moves + on pointer-up) so it never
// stalls a scroll frame.
export default function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    let revealed = false
    let drawing = false
    let last: { x: number; y: number } | null = null
    let moves = 0

    function paintFoil() {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (!r.width) return
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      const g = ctx.createLinearGradient(0, 0, r.width, r.height)
      g.addColorStop(0, '#b8862f')
      g.addColorStop(0.3, '#f5d98a')
      g.addColorStop(0.5, '#c99a3c')
      g.addColorStop(0.7, '#ffe9a8')
      g.addColorStop(1, '#a8741f')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, r.width, r.height)
      ctx.strokeStyle = 'rgba(255,255,255,.14)'
      ctx.lineWidth = 1
      for (let x = -r.height; x < r.width; x += 7) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + r.height, r.height)
        ctx.stroke()
      }
      ctx.fillStyle = '#5a3410'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '600 13px "Cinzel", serif'
      ctx.fillText('S C R A T C H   H E R E', r.width / 2, r.height / 2 - 22)
      ctx.font = '44px "Pinyon Script", cursive'
      ctx.fillText('Y & I', r.width / 2, r.height / 2 + 16)
    }
    function pos(e: PointerEvent) {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    function scratchAt(p: { x: number; y: number }) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      ctx.lineWidth = 42
      ctx.beginPath()
      ctx.moveTo((last || p).x, (last || p).y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      last = p
      if (++moves % 8 === 0) check()
    }
    function check() {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let clear = 0
      let total = 0
      for (let k = 3; k < data.length; k += 64) {
        total++
        if (data[k] < 40) clear++
      }
      if (clear / total > 0.5) reveal()
    }
    function reveal() {
      if (revealed) return
      revealed = true
      canvas.classList.add('done')
      const host = hostRef.current!
      const cols = ['#ffd24a', '#ff8a1c', '#f7c6d0', '#ffffff', '#d4a445']
      for (let q = 0; q < 30; q++) {
        const sp = document.createElement('span')
        sp.className = 'confetti'
        const ang = Math.random() * Math.PI * 2
        const dist = 110 + Math.random() * 110
        sp.style.setProperty('--c', cols[q % cols.length])
        sp.style.setProperty('--tx', (Math.cos(ang) * dist).toFixed(0) + 'px')
        sp.style.setProperty('--ty', (Math.sin(ang) * dist - 20).toFixed(0) + 'px')
        host.appendChild(sp)
        setTimeout(() => sp.remove(), 1700)
      }
      onReveal()
    }

    const onDown = (e: PointerEvent) => {
      if (revealed) return
      drawing = true
      last = null
      canvas.setPointerCapture(e.pointerId)
      scratchAt(pos(e))
    }
    const onMove = (e: PointerEvent) => {
      if (drawing) scratchAt(pos(e))
    }
    const onUp = () => {
      drawing = false
      last = null
      if (!revealed) check()
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    if (document.fonts?.ready) document.fonts.ready.then(paintFoil)
    paintFoil()
    const ro = new ResizeObserver(() => {
      if (!revealed) paintFoil()
    })
    ro.observe(canvas)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      ro.disconnect()
    }
  }, [onReveal])

  return (
    <div className="scratch" ref={hostRef}>
      <ul className="dates">
        {DATE_ROWS.map((d) => (
          <li key={d.label}>
            <b>{d.label}</b>
            <span>{d.value}</span>
          </li>
        ))}
      </ul>
      <canvas ref={canvasRef} aria-label="Gold scratch card covering the dates"></canvas>
    </div>
  )
}
