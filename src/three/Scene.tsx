import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EV, GATE, D } from './events'
import { asset } from '../config'
import { clamp, lerp, easeIO, easeIn, easeOut } from '../util'
import { useStore, shared } from '../state/store'
import { qualityFor } from './quality'
import { configureTexture } from './textures'
import { buildGate } from './gate'
import { buildStory } from './story'
import { buildParticles, type ParticleSystem } from './particles'

interface Props {
  beckonRef: React.RefObject<HTMLDivElement>
  flashRef: React.RefObject<HTMLDivElement>
  threadBeadRef: React.RefObject<HTMLElement>
}

// Opening-sequence keyframes (seconds since Enter tap), ported from app.js:462-482.
function timeline(reduce: boolean) {
  if (reduce) {
    return { door: 0.8, open: 0.6, startDolly: 0, dolly: 0, flash: 0.9, switch: 1.5, revStart: 1.65, revDur: 0.3, flashOff: 1.62 }
  }
  return { door: 2.3, open: 1.3, startDolly: 1.05, dolly: 1.95, flash: 2.55, switch: 3.15, revStart: 3.3, revDur: 1.9, flashOff: 3.27 }
}

export default function Scene({ beckonRef, flashRef, threadBeadRef }: Props) {
  const { gl, camera, scene } = useThree()
  const tier = useStore((s) => s.tier)
  const quality = useMemo(() => qualityFor(tier), [tier])
  const reduce = quality.drift === 0

  const time = useMemo(() => ({ value: 0 }), [])
  const res = useMemo(() => new THREE.Vector2(1, 1), [])
  const camPos = useRef({ x: 0, y: 0, z: D })
  const switched = useRef(false)
  const layout = useRef({ h0: 1, w0: 1 })

  const ptr = useRef({ x: 0, y: 0, sx: 0, sy: 0 })

  // Load the gate texture once; flips gateReady so the Enter button becomes tappable.
  const [gateTex, setGateTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(asset('gate'), (t) => {
      configureTexture(t)
      setGateTex(t)
      useStore.getState().setGateReady(true)
    })
  }, [])

  // Build the whole scene once the gate texture is ready; rebuild on quality change.
  const built = useMemo(() => {
    if (!gateTex) return null
    const gate = buildGate(gl, gateTex, time, res, quality.gateBlur)
    const story = buildStory(time, res, quality.extras)
    const particles = buildParticles(quality.particleCount, time)
    return { gate, story, particles }
  }, [gateTex, quality.gateBlur, quality.extras, quality.particleCount, gl, time, res])

  // Add to scene + dispose on rebuild/unmount.
  useEffect(() => {
    if (!built) return
    scene.add(built.gate.group, built.story.group, built.particles.mesh)
    return () => {
      scene.remove(built.gate.group, built.story.group, built.particles.mesh)
      built.gate.dispose()
      built.story.dispose()
      built.particles.dispose()
    }
  }, [built, scene])

  // Layout on resize (and when (re)built). No per-frame layout work.
  const { size } = useThree()
  useEffect(() => {
    if (!built) return
    const cam = camera as THREE.PerspectiveCamera
    cam.aspect = size.width / size.height
    cam.updateProjectionMatrix()
    const h0 = 2 * D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    const w0 = h0 * cam.aspect
    layout.current = { h0, w0 }
    built.particles.uniforms.uBox.value.set(Math.max(w0, h0 * 0.6) * 1.5, h0 * 1.35, 1)
    gl.getDrawingBufferSize(res)
    built.gate.layout(h0, w0, cam, beckonRef.current)
    built.story.layout(h0, w0)
  }, [built, size.width, size.height, camera, gl, res, beckonRef])

  // Pointer parallax.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / innerWidth) * 2 - 1
      ptr.current.y = -((e.clientY / innerHeight) * 2 - 1)
    }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [])

  // Reusable color scratch for blendUniforms (no per-frame allocation).
  const ctmp = useMemo(
    () => ({ a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), mix: [new THREE.Color(), new THREE.Color(), new THREE.Color()] }),
    [],
  )

  function blendUniforms(P: ParticleSystem['uniforms'], weights: number[], gateW: number) {
    let fall = gateW * GATE.fall
    let spark = gateW * GATE.spark
    let size2 = gateW * GATE.psize
    ctmp.c.set(GATE.clear).multiplyScalar(gateW)
    for (let c = 0; c < 3; c++) ctmp.mix[c].set(GATE.cols[c]).multiplyScalar(gateW)
    EV.forEach((ev, i) => {
      const w = weights[i]
      if (!w) return
      fall += w * ev.fall
      spark += w * ev.spark
      size2 += w * ev.psize
      ctmp.c.add(ctmp.a.set(ev.clear).multiplyScalar(w))
      for (let c = 0; c < 3; c++) ctmp.mix[c].add(ctmp.b.set(ev.cols[c]).multiplyScalar(w))
    })
    P.uFall.value = fall
    P.uSpark.value = spark
    P.uSize.value = size2
    P.uC1.value.copy(ctmp.mix[0])
    P.uC2.value.copy(ctmp.mix[1])
    P.uC3.value.copy(ctmp.mix[2])
    gl.setClearColor(ctmp.c)
  }

  const TL = useMemo(() => timeline(reduce), [reduce])

  useFrame((state, delta) => {
    if (!built) return
    if (document.hidden) return
    const now = state.clock.elapsedTime
    time.value = now
    const dt = Math.min(0.05, Math.max(0, delta))
    const kk = 1 - Math.exp(-dt * 11)
    gl.getDrawingBufferSize(res)

    const p = ptr.current
    p.sx += (p.x - p.sx) * 0.05
    p.sy += (p.y - p.sy) * 0.05
    const drift = quality.drift

    const { gate, story, particles } = built
    const P = particles.uniforms
    const cam = camPos.current
    const mode = useStore.getState().mode

    // Advance the opening timeline clock while entering and until the first
    // chapter has finished revealing (entryReveal runs past the gate->story flip).
    if (shared.entered && shared.entryReveal < 1) {
      shared.phaseT += dt
      shared.entryReveal = easeOut(clamp((shared.phaseT - TL.revStart) / TL.revDur))
      // Flash is driven here (not in the 'opening' branch) so it still fades out
      // after the mode has already flipped to 'story'.
      if (flashRef.current) {
        flashRef.current.style.opacity = shared.phaseT >= TL.flash && shared.phaseT < TL.flashOff ? '1' : '0'
      }
    }

    // ----- Opening timeline -----
    if (mode === 'opening') {
      const pt = shared.phaseT
      const kDoor = clamp(pt / TL.door)
      const angle = easeIO(kDoor) * 1.34
      gate.leafL.rotation.y = angle
      gate.leafR.rotation.y = -angle
      ;(gate.leafL.material as THREE.ShaderMaterial).uniforms.uAngle.value = angle
      ;(gate.leafR.material as THREE.ShaderMaterial).uniforms.uAngle.value = angle
      gate.gateOpen.value = easeOut(clamp(pt / TL.open))
      if (!reduce && TL.dolly > 0) {
        const e = easeIn(clamp((pt - TL.startDolly) / TL.dolly))
        cam.z = lerp(D, 0.3, e)
        cam.y = lerp(0, gate.door.cy, easeOut(e))
      }
      if (!switched.current && pt >= TL.switch) {
        switched.current = true
        gate.group.visible = false
        story.group.visible = true
        cam.x = 0
        cam.y = 0
        cam.z = D
        useStore.getState().setMode('story')
      }
    }

    if (mode !== 'story') {
      // ----- Gate / opening camera -----
      camera.position.set(
        cam.x + (p.sx * 0.05 + Math.sin(now * 0.4) * 0.02) * drift * (cam.z / D),
        cam.y + p.sy * 0.03 * drift * (cam.z / D),
        cam.z,
      )
      blendUniforms(P, [0, 0, 0, 0], 1)
      P.uAlpha.value = 1
    } else {
      // ----- Story -----
      const vh = shared.vh
      const scrollY = shared.scrollY
      const rev: number[] = []
      const prog: number[] = []
      for (let i = 0; i < shared.chapters.length; i++) {
        const geom = shared.chapters[i]
        const rTop = geom.top - scrollY
        const rBottom = geom.top + geom.height - scrollY
        const tp = clamp((scrollY - geom.top) / (geom.height - vh))
        const tr = i === 0 ? shared.entryReveal : clamp((vh - rTop) / (vh * 0.8))
        const tx = clamp(1 - rBottom / vh)
        shared.prog[i] += (tp - shared.prog[i]) * kk
        shared.rev[i] += (tr - shared.rev[i]) * kk
        shared.x[i] += (tx - shared.x[i]) * kk
        prog[i] = shared.prog[i]
        rev[i] = shared.rev[i]
        const el = geom.el
        el.style.setProperty('--r', rev[i].toFixed(3))
        el.style.setProperty('--p', prog[i].toFixed(3))
        el.style.setProperty('--tx', clamp((rev[i] - 0.5) / 0.5 + prog[i] * 4).toFixed(3))
        el.style.setProperty('--x', shared.x[i].toFixed(3))
      }

      if (shared.savedate) {
        const sdTop = shared.savedate.top - scrollY
        shared.dim += (clamp(1 - sdTop / vh) * 0.72 - shared.dim) * kk
      }
      const dim = shared.dim

      const weights: number[] = []
      let cur = 0
      EV.forEach((ev, i) => {
        const next = i < EV.length - 1 ? rev[i + 1] : 0
        weights[i] = rev[i] * (1 - next)
        if (rev[i] > 0) cur = i
        const se = story.events[i]
        se.group.visible = rev[i] > 0 && next < 1
        se.u.reveal.value = easeIO(rev[i])
        se.u.dim.value = dim
        const f = lerp(ev.focus[0], ev.focus[1], easeIO(prog[i]))
        se.group.position.x = (0.5 - f) * se.W
        const vis = weights[i] * (1 - dim)
        se.extras.forEach((m) => {
          const d = m.userData as { kind: string; base?: number; ph?: number; I?: number }
          const uu = (m.material as THREE.ShaderMaterial).uniforms
          if (d.kind === 'beam') {
            uu.uI.value = 0.55 * vis
            m.rotation.z = (d.base as number) + Math.sin(now * 0.8 + (d.ph as number)) * 0.32 * drift
          } else {
            uu.uI.value = (d.I as number) * vis
          }
        })
      })

      blendUniforms(P, weights, 0)
      P.uAlpha.value = 1 - dim * 0.4
      const z = D * (1 - 0.075 * easeIO(prog[cur]))
      camera.position.set(
        (p.sx * 0.06 + Math.sin(now * 0.33) * 0.03) * drift,
        (p.sy * 0.04 + Math.cos(now * 0.27) * 0.018) * drift,
        z,
      )
      if (threadBeadRef.current) {
        const max = shared.scrollMax
        threadBeadRef.current.style.setProperty('--p', (max > 0 ? (scrollY / max) * 100 : 0).toFixed(2) + '%')
      }
    }
  })

  return null
}
