import * as THREE from 'three'
import { BASIC_VS, GLOW_FS, STAR_FS } from './shaders'

export type MatOpts = THREE.ShaderMaterialParameters

// Mirrors the old `mat()` helper.
export function mat(opts: MatOpts): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial(
    Object.assign({ transparent: true, depthTest: false, depthWrite: false }, opts),
  )
}

const QUAD = new THREE.PlaneGeometry(1, 1)

export function glowSprite(color: string, flicker: number, time: { value: number }): THREE.Mesh {
  const m = new THREE.Mesh(
    QUAD,
    mat({
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uI: { value: 1 },
        uTime: time,
        uF: { value: flicker },
        uSeed: { value: Math.random() * 10 },
      },
      vertexShader: BASIC_VS,
      fragmentShader: GLOW_FS,
    }),
  )
  m.renderOrder = 3
  return m
}

export function starSprite(color: string, time: { value: number }): THREE.Mesh {
  const m = new THREE.Mesh(
    QUAD,
    mat({
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uI: { value: 1 },
        uTime: time,
        uSeed: { value: Math.random() * 10 },
      },
      vertexShader: BASIC_VS,
      fragmentShader: STAR_FS,
    }),
  )
  m.renderOrder = 4
  return m
}
