import * as THREE from 'three'
import { BASIC_VS, GATE_BACK_FS } from './shaders'

// Matches the old `tex()` helper: linear filtering, no mipmaps, clamp to edge.
export function configureTexture(t: THREE.Texture): THREE.Texture {
  t.minFilter = THREE.LinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = false
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

/**
 * Bake the gate backdrop blur ONCE into a static texture.
 * The original ran a 49-tap blur per pixel every frame even though its result
 * never changes. We render it a single time to an offscreen target instead.
 */
export function bakeBlurredGateTexture(
  gl: THREE.WebGLRenderer,
  src: THREE.Texture,
  width = 512,
): THREE.Texture {
  const srcImg = src.image as { width?: number; height?: number } | undefined
  const aspect = srcImg?.width && srcImg?.height ? srcImg.height / srcImg.width : 1847 / 900
  const w = width
  const h = Math.round(width * aspect)

  const target = new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  })

  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: src } },
    vertexShader: BASIC_VS,
    fragmentShader: GATE_BACK_FS,
    depthTest: false,
    depthWrite: false,
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
  scene.add(quad)

  const prevTarget = gl.getRenderTarget()
  gl.setRenderTarget(target)
  gl.render(scene, cam)
  gl.setRenderTarget(prevTarget)

  quad.geometry.dispose()
  mat.dispose()

  configureTexture(target.texture)
  return target.texture
}
