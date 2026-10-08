import * as THREE from 'three'
import { GATE } from './events'
import { PARTICLE_VS, PARTICLE_FS } from './shaders'

export interface ParticleSystem {
  mesh: THREE.Mesh
  uniforms: {
    uTime: { value: number }
    uFall: { value: number }
    uSpark: { value: number }
    uSize: { value: number }
    uBox: { value: THREE.Vector3 }
    uAlpha: { value: number }
    uC1: { value: THREE.Color }
    uC2: { value: THREE.Color }
    uC3: { value: THREE.Color }
  }
  dispose: () => void
}

// Ported from app.js:385-430. One instanced draw call.
export function buildParticles(count: number, time: { value: number }): ParticleSystem {
  const base = new THREE.PlaneGeometry(1, 1)
  const pgeo = new THREE.InstancedBufferGeometry()
  pgeo.index = base.index
  pgeo.setAttribute('position', base.attributes.position)
  pgeo.setAttribute('uv', base.attributes.uv)
  const seeds = new Float32Array(count * 4)
  for (let si = 0; si < seeds.length; si++) seeds[si] = Math.random()
  pgeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4))
  pgeo.instanceCount = count

  const uniforms = {
    uTime: time,
    uFall: { value: 0 },
    uSpark: { value: 1 },
    uSize: { value: 0.05 },
    uBox: { value: new THREE.Vector3(2, 4, 1) },
    uAlpha: { value: 1 },
    uC1: { value: new THREE.Color(GATE.cols[0]) },
    uC2: { value: new THREE.Color(GATE.cols[1]) },
    uC3: { value: new THREE.Color(GATE.cols[2]) },
  }

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: PARTICLE_VS,
    fragmentShader: PARTICLE_FS,
  })

  const mesh = new THREE.Mesh(pgeo, mat)
  mesh.frustumCulled = false
  mesh.renderOrder = 100

  return {
    mesh,
    uniforms,
    dispose: () => {
      pgeo.dispose()
      base.dispose()
      mat.dispose()
    },
  }
}
