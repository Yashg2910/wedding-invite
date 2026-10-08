// Per-event art direction — ported verbatim from the old js/app.js `EV` array.
import { size } from '../config'

export interface EventDef {
  key: string
  focus: [number, number]
  clear: string
  sway: number
  bob: number
  glitter: number
  fall: number
  spark: number
  cols: [string, string, string]
  psize: number
  edge: string
  seed: number
  aspect: number
}

const RAW = [
  { key: 'haldi', focus: [0.5, 0.54], clear: '#f1c96e', sway: 0.005, bob: 0.003, glitter: 0, fall: 1, spark: 0, cols: ['#ff8a1c', '#ffb01f', '#ffd24a'], psize: 0.055, edge: '#ffb300', seed: 1.3 },
  { key: 'sangeet', focus: [0.36, 0.64], clear: '#140f33', sway: 0.014, bob: 0.008, glitter: 1.1, fall: 0.1, spark: 1, cols: ['#ff8fe0', '#8fe3ff', '#ffe39a'], psize: 0.08, edge: '#c07bff', seed: 4.1 },
  { key: 'phere', focus: [0.5, 0.57], clear: '#e5ad78', sway: 0.004, bob: 0.002, glitter: 0.45, fall: 1, spark: 0, cols: ['#f7c6d0', '#ffffff', '#e8849a'], psize: 0.05, edge: '#ff6a3d', seed: 7.7 },
  { key: 'reception', focus: [0.5, 0.5], clear: '#2a141c', sway: 0.005, bob: 0.0025, glitter: 0.75, fall: 0, spark: 1, cols: ['#ffe39a', '#ffd98a', '#fff3c8'], psize: 0.06, edge: '#ffd36b', seed: 2.9 },
] as const

export const EV: EventDef[] = RAW.map((e) => {
  const [w, h] = size(e.key)
  return { ...e, cols: [...e.cols] as [string, string, string], focus: [...e.focus] as [number, number], aspect: w / h }
})

export const GATE = {
  clear: '#120a1c',
  fall: 0,
  spark: 1,
  cols: ['#ffd98a', '#ffe7b0', '#ffb347'] as [string, string, string],
  psize: 0.045,
}

// Door rectangle in the gate image (u0, u1, v0, v1 with v measured from the bottom)
// and the arch shoulder height.
export const DOOR: [number, number, number, number] = [0.2886, 0.7114, 0.0168, 0.5049]
export const SHOULDER = 0.565
export const GATE_ASPECT = 900 / 1847
export const DOOR_FRAC = 0.64 // how much of the screen height the doorway fills
export const ZB = 0.8 // backdrop depth offset in story scenes
export const D = 5 // base camera distance
