# Yash & Isha — wedding invitation

React + [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) (three.js) single-page site, built with Vite + TypeScript. The 3D gate + scrolling story is the same experience as before, rewritten as components and tuned for smooth 60fps on mobile.

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173
```

Open http://localhost:5173/?preview&to=Manoj-Gupta. The `?preview` flag shows the guest-name preview box (top right); guests never see it. Use `npm run dev -- --host` to test from a phone on the same network.

## Build & preview

```bash
npm run build          # type-checks, then outputs to dist/
npm run preview        # serve the production build locally
```

## Where things live

| What | File |
|---|---|
| Countdown date, family surname, image list | `src/config.ts` |
| Event art direction (pan, colours, particles, seeds) | `src/three/events.ts` |
| Event text: titles, Hindi, descriptions, dress code | `src/dom/chapters.tsx` |
| Fonts, colours, layout, scroll timing (chapter height) | `src/styles/style.css` |
| 3D scene orchestration (the single frame loop) | `src/three/Scene.tsx` |
| Gate (doors, rays, diyas) / story layers / particles | `src/three/{gate,story,particles}.ts` |
| GLSL shaders (ported verbatim) | `src/three/shaders.ts` |
| Quality tiers (mobile perf trade-offs) | `src/three/quality.ts` |
| DOM overlays (gate text, scratch card, countdown) | `src/dom/*.tsx` |
| Image layers (backdrop + cut-out couple per event, gate) | `public/assets/` |
| Regenerating the layers from new Gemini art | `tools/prep_assets.py` |

The original vanilla build is kept under `legacy/` for reference.

### Performance notes (why it's smooth on mobile)

- **Adaptive resolution**: drei `<PerformanceMonitor>` + `<AdaptiveDpr>` drop DPR under load; `src/three/quality.ts` gates particle count / effects per device tier.
- **Baked gate blur**: the old per-frame 49-tap backdrop blur is rendered once to a texture (`src/three/textures.ts`).
- **No layout thrash**: scroll position is read once per scroll event and section geometry is cached on resize (`src/dom/useScrollDriver.ts`); the frame loop never calls `getBoundingClientRect`.
- **One frame loop**: all per-frame work lives in a single `useFrame` mutating refs/uniforms — React never re-renders per frame.

## Guest links

`https://<your-site>/?to=Manoj-Gupta` shows "Shri Manoj Gupta ji & Parivar".
Add `&style=friend` for "Dear Rohan". No `to` shows "Dear Family & Friends".
Generate links from a spreadsheet rather than typing them.

## Deploy

Netlify builds from the repo: build command `npm run build`, publish directory `dist` (already set in `netlify.toml`). Connect the repo in Netlify and it deploys on push.
If the final address isn't `invite.ishayash.life`, update the `og:image` URL in `index.html`
so the WhatsApp preview image works.

## Before sending to guests

- Replace every "to be added" in `src/dom/chapters.tsx` and the sample `weddingDate` in `src/config.ts`.
- Test on a cheap Android phone, opened from a WhatsApp chat.
