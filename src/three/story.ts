import * as THREE from 'three'
import { EV, ZB, D } from './events'
import { asset } from '../config'
import { LAYER_VS, LAYER_FS, BASIC_VS, BEAM_FS } from './shaders'
import { mat, glowSprite, starSprite } from './sprites'
import { configureTexture } from './textures'

interface ExtraUserData {
  u: number
  v: number
  s?: number
  base?: number
  ph?: number
  I?: number
  kind: 'beam' | 'glow' | 'star'
}

export interface StoryEvent {
  group: THREE.Group
  u: { reveal: { value: number }; dim: { value: number }; fade: { value: number } }
  bg: THREE.Mesh
  fg: THREE.Mesh
  extras: THREE.Mesh[]
  W: number
  H: number
  aspect: number
}

export interface Story {
  group: THREE.Group
  events: StoryEvent[]
  layout: (h0: number, w0: number) => void
  dispose: () => void
}

export function buildStory(
  time: { value: number },
  res: THREE.Vector2,
  extrasEnabled: boolean,
): Story {
  const storyG = new THREE.Group()
  storyG.visible = false
  const loader = new THREE.TextureLoader()
  const loadTex = (uri: string) => configureTexture(loader.load(uri))

  const events: StoryEvent[] = EV.map((ev, i) => {
    const g = new THREE.Group()
    g.visible = false
    storyG.add(g)
    const u = { reveal: { value: 0 }, dim: { value: 0 }, fade: { value: 0 } }

    const layer = (uri: string, isFg: boolean, seg: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1, 1, seg),
        mat({
          uniforms: {
            map: { value: loadTex(uri) },
            uReveal: u.reveal,
            uDim: u.dim,
            uFade: u.fade,
            uTime: time,
            uRes: { value: res },
            uGlitter: { value: isFg ? ev.glitter : 0 },
            uSeed: { value: ev.seed },
            uEdge: { value: new THREE.Color(ev.edge) },
            uSway: { value: isFg ? ev.sway : 0 },
            uBob: { value: isFg ? ev.bob : 0 },
            uFg: { value: isFg ? 1 : 0 },
          },
          vertexShader: LAYER_VS,
          fragmentShader: LAYER_FS,
        }),
      )
      m.renderOrder = i * 10 + (isFg ? 3 : 0)
      return m
    }

    const bg = layer(asset(ev.key + '_bg'), false, 1)
    bg.position.z = -ZB
    const fg = layer(asset(ev.key + '_fg'), true, 24)
    g.add(bg, fg)

    return { group: g, u, bg, fg, extras: [], W: 1, H: 1, aspect: ev.aspect }
  })

  if (extrasEnabled) {
    // Sangeet: sweeping stage beams between backdrop and couple.
    const beamMat = (col: string) =>
      mat({
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(col) }, uI: { value: 0 } },
        vertexShader: BASIC_VS,
        fragmentShader: BEAM_FS,
      })
    ;[
      [0.04, 0.82, '#ff6fd8', -0.35],
      [0.2, 0.81, '#ff9ae8', -0.15],
      [0.8, 0.81, '#7fdcff', 0.15],
      [0.96, 0.82, '#ffe39a', 0.35],
    ].forEach((b, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0), beamMat(b[2] as string))
      m.renderOrder = 1 * 10 + 1
      m.userData = { u: b[0], v: b[1], base: b[3], ph: k * 1.7, kind: 'beam' } as ExtraUserData
      events[1].group.add(m)
      events[1].extras.push(m)
    })

    // Phere: firelight from the havan kund.
    {
      const f1 = glowSprite('#ff9a3c', 1.6, time)
      const f2 = glowSprite('#ffd27a', 2.2, time)
      f1.renderOrder = f2.renderOrder = 2 * 10 + 4
      f1.userData = { u: 0.509, v: 0.27, s: 0.5, kind: 'glow', I: 0.95 } as ExtraUserData
      f2.userData = { u: 0.509, v: 0.255, s: 0.22, kind: 'glow', I: 1 } as ExtraUserData
      events[2].group.add(f1, f2)
      events[2].extras.push(f1, f2)
    }

    // Reception: chandeliers catching the light.
    {
      ;[
        [0.505, 0.9, 0.28],
        [0.44, 0.88, 0.12],
        [0.57, 0.885, 0.12],
        [0.03, 0.76, 0.16],
        [0.97, 0.76, 0.16],
        [0.5, 0.66, 0.12],
      ].forEach((p) => {
        const s = starSprite('#fff4d6', time)
        s.renderOrder = 3 * 10 + 4
        s.userData = { u: p[0], v: p[1], s: p[2], kind: 'star', I: 1 } as ExtraUserData
        events[3].group.add(s)
        events[3].extras.push(s)
      })
      const halo = glowSprite('#ffd98a', 0.3, time)
      halo.renderOrder = 3 * 10 + 1
      halo.userData = { u: 0.505, v: 0.9, s: 0.7, kind: 'glow', I: 0.55 } as ExtraUserData
      events[3].group.add(halo)
      events[3].extras.push(halo)
    }

    // Haldi: warm sunlight bloom.
    {
      const sun = glowSprite('#fff1b0', 0.2, time)
      sun.renderOrder = 1
      sun.userData = { u: 0.5, v: 0.78, s: 1.1, kind: 'glow', I: 0.45 } as ExtraUserData
      events[0].group.add(sun)
      events[0].extras.push(sun)
    }
  }

  function layout(h0: number, w0: number) {
    const H = h0 * 1.1
    const S = (D + ZB) / D
    events.forEach((ev) => {
      const W = H * ev.aspect
      ev.W = W
      ev.H = H
      ev.fg.scale.set(W, H, 1)
      ev.bg.scale.set(W * S * 1.03, H * S * 1.03, 1)
      ev.u.fade.value = W < w0 * 1.02 ? 1 : 0
      ev.extras.forEach((m) => {
        const d = m.userData as ExtraUserData
        const x = (d.u - 0.5) * W
        const y = (d.v - 0.5) * H
        if (d.kind === 'beam') {
          m.scale.set(W * 0.55, H * 1.1, 1)
          m.position.set(x * S, y * S, -ZB * 0.5)
        } else {
          m.scale.set(W * (d.s as number), W * (d.s as number), 1)
          m.position.set(x, y, 0.01)
        }
      })
    })
  }

  function dispose() {
    storyG.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mm = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mm)) mm.forEach((x) => x.dispose())
      else if (mm) {
        const tx = (mm as THREE.ShaderMaterial).uniforms?.map?.value as THREE.Texture | undefined
        tx?.dispose()
        mm.dispose()
      }
    })
  }

  return { group: storyG, events, layout, dispose }
}
