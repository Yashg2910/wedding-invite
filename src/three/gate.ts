import * as THREE from 'three'
import { DOOR, SHOULDER, GATE_ASPECT, DOOR_FRAC, D } from './events'
import { BASIC_VS, GATE_FS, LEAF_FS, RAYS_FS } from './shaders'
import { mat, glowSprite } from './sprites'
import { bakeBlurredGateTexture } from './textures'

export interface GateDoor {
  cy: number
  dw: number
  seamY: number
}

export interface Gate {
  group: THREE.Group
  gateOpen: { value: number }
  leafL: THREE.Mesh
  leafR: THREE.Mesh
  door: GateDoor
  layout: (h0: number, w0: number, camera: THREE.PerspectiveCamera, beckon: HTMLElement | null) => void
  dispose: () => void
}

export function buildGate(
  gl: THREE.WebGLRenderer,
  gateTex: THREE.Texture,
  time: { value: number },
  res: THREE.Vector2,
  gateBlur: boolean,
): Gate {
  const group = new THREE.Group()
  const doorV = new THREE.Vector4(DOOR[0], DOOR[1], DOOR[2], DOOR[3])
  const gateOpen = { value: 0 }

  const gatePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    mat({
      transparent: false,
      uniforms: {
        map: { value: gateTex },
        uDoor: { value: doorV },
        uShoulder: { value: SHOULDER },
        uOpen: gateOpen,
        uTime: time,
        uRes: { value: res },
      },
      vertexShader: BASIC_VS,
      fragmentShader: GATE_FS,
    }),
  )
  group.add(gatePlane)

  // Backdrop: baked once instead of a per-frame 49-tap blur.
  const backTex = gateBlur ? bakeBlurredGateTexture(gl, gateTex) : null
  const gateBack = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    backTex
      ? new THREE.MeshBasicMaterial({ map: backTex, depthTest: false, depthWrite: false })
      : new THREE.MeshBasicMaterial({ color: 0x0a0610, depthTest: false, depthWrite: false }),
  )
  gateBack.renderOrder = -1
  gateBack.position.z = -0.05
  group.add(gateBack)

  function leafMat(side: number) {
    return mat({
      transparent: false,
      side: THREE.DoubleSide,
      uniforms: {
        map: { value: gateTex },
        uDoor: { value: doorV },
        uShoulder: { value: SHOULDER },
        uSide: { value: side },
        uOpen: gateOpen,
        uAngle: { value: 0 },
        uTime: time,
      },
      vertexShader: BASIC_VS,
      fragmentShader: LEAF_FS,
    })
  }
  const leafL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0), leafMat(0))
  const leafR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(-0.5, 0, 0), leafMat(1))
  leafL.renderOrder = leafR.renderOrder = 1
  group.add(leafL, leafR)

  const rays = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    mat({
      blending: THREE.AdditiveBlending,
      uniforms: { uOpen: gateOpen, uTime: time },
      vertexShader: BASIC_VS,
      fragmentShader: RAYS_FS,
    }),
  )
  rays.renderOrder = 2
  group.add(rays)

  const diyaL = glowSprite('#ffb347', 1, time)
  const diyaR = glowSprite('#ffb347', 1, time)
  group.add(diyaL, diyaR)

  const door: GateDoor = { cy: 0, dw: 0, seamY: 0 }
  const hv = new THREE.Vector3()

  function layout(
    h0: number,
    w0: number,
    camera: THREE.PerspectiveCamera,
    beckon: HTMLElement | null,
  ) {
    const dh = h0 * DOOR_FRAC
    const H = dh / (DOOR[3] - DOOR[2])
    const W = H * GATE_ASPECT
    const yb = -h0 / 2 + h0 * 0.03
    const yc = yb + (0.5 - DOOR[2]) * H
    gatePlane.scale.set(W, H, 1)
    gatePlane.position.set(0, yc, 0)
    const x0 = (-0.5 + DOOR[0]) * W
    const x1 = (-0.5 + DOOR[1]) * W
    const yt = yb + dh
    const dw = x1 - x0
    const cy = (yb + yt) / 2
    leafL.scale.set(dw / 2, dh, 1)
    leafL.position.set(x0, cy, 0.003)
    leafR.scale.set(dw / 2, dh, 1)
    leafR.position.set(x1, cy, 0.003)
    rays.scale.set(dw * 3.6, dw * 3.6, 1)
    rays.position.set(0, yb + dh * 0.4, 0.01)
    diyaL.scale.set(W * 0.16, W * 0.16, 1)
    diyaL.position.set(x0 - W * 0.055, yb + H * 0.012, 0.02)
    diyaR.scale.copy(diyaL.scale)
    diyaR.position.set(x1 + W * 0.055, yb + H * 0.012, 0.02)
    const Hb = Math.max(h0, w0 / GATE_ASPECT) * 1.04
    gateBack.scale.set(Hb * GATE_ASPECT, Hb, 1)
    gateBack.visible = W < w0 * 1.01
    door.cy = yb + dh * 0.42
    door.dw = dw
    door.seamY = yb + dh * 0.5
    // Point the hand at the seam between the doors.
    const keep = camera.position.clone()
    camera.position.set(0, 0, D)
    camera.updateMatrixWorld()
    hv.set(0, door.seamY, 0).project(camera)
    camera.position.copy(keep)
    camera.updateMatrixWorld()
    if (beckon) {
      beckon.style.left = ((hv.x * 0.5 + 0.5) * innerWidth).toFixed(1) + 'px'
      beckon.style.top = ((-hv.y * 0.5 + 0.5) * innerHeight).toFixed(1) + 'px'
    }
  }

  function dispose() {
    group.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mm = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mm)) mm.forEach((x) => x.dispose())
      else if (mm) mm.dispose()
    })
    backTex?.dispose()
  }

  return { group, gateOpen, leafL, leafR, door, layout, dispose }
}
