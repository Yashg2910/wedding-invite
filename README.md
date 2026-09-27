# Yash & Isha — wedding invitation

Static site, no build step. three.js r128 is vendored in `vendor/`.

## Run locally

The WebGL textures load over HTTP, so opening `index.html` straight from disk won't work. Serve the folder:

```bash
python3 -m http.server 8080      # or: npx serve .
```

Open http://localhost:8080/?preview&to=Manoj-Gupta. The `?preview` flag shows the guest-name preview box (top right); guests never see it.

## Where things live

| What | File |
|---|---|
| Countdown date, family surname, image list | `js/config.js` |
| Event text: titles, Hindi, descriptions, date/time/venue, dress code | `index.html` (one `<section class="chapter">` per event) |
| Fonts, colours, layout, scroll timing (chapter height) | `css/style.css` |
| 3D scene: gate, doors, transitions, particles, per-event effects | `js/app.js` |
| Image layers (backdrop + cut-out couple per event, gate) | `assets/` |
| Regenerating the layers from new Gemini art | `tools/prep_assets.py` |

Useful knobs in `js/app.js`:
- `EV` array: per-event pan (`focus`), sway strength, sequin `glitter`, particle colours and type, transition edge colour.
- `DOOR_FRAC`: how much of the screen height the doorway fills (0.64 now).
- `DOOR`, `SHOULDER`, `GATE_ASPECT`: door rectangle in the gate art. Re-measure these if you change the gate image.

## Guest links

`https://<your-site>/?to=Manoj-Gupta` shows "Shri Manoj Gupta ji & Parivar".
Add `&style=friend` for "Dear Rohan". No `to` shows "Dear Family & Friends".
Generate links from a spreadsheet rather than typing them.

## Deploy

Netlify: drag this folder onto app.netlify.com/drop (while signed in), then rename the site.
If the final address isn't `yash-weds-isha.netlify.app`, update the `og:image` URL in `index.html`
so the WhatsApp preview image works.

## Before sending to guests

- Replace every "to be added" in `index.html` and the sample `weddingDate` in `js/config.js`.
- Test on a cheap Android phone, opened from a WhatsApp chat.
# wedding-invite
