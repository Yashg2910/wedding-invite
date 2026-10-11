// The pointing mehendi hand, shared by the landing gate and the per-event CTAs.
// A raster cutout (public/assets/hand.webp); the finger points up-and-left.
export default function HandSVG() {
  return <img className="hand-img" src="/assets/hand.webp" alt="" aria-hidden="true" draggable={false} />
}
