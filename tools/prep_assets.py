"""
Regenerate the website's image layers from the Gemini originals.

Put the originals in ../source-art/ with these names, then run:
    pip install -r tools/requirements.txt
    python tools/prep_assets.py

  gate.png        Rajwada gate, straight-on
  haldi.png       Haldi caricature
  sangeet.png     Sangeet caricature
  phere.png       Baraat/Phere caricature
  reception.png   Reception caricature

For each event it writes assets/<event>_bg.webp (backdrop with the couple
painted out) and assets/<event>_fg.webp (the couple cut out, transparent).
It prints the pixel sizes to paste into js/config.js.

If you replace the gate art, re-measure the door rectangle and update
DOOR / SHOULDER / GATE_ASPECT near the top of js/app.js.
"""
import io, os, sys
import numpy as np, cv2
from PIL import Image
from rembg import new_session, remove

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, 'source-art'), os.path.join(ROOT, 'assets')
WIDTH = 900

# Gemini letterboxing to trim, as (x0, y0, x1, y1) in source pixels. None keeps the whole image.
CROPS = {'haldi': None, 'sangeet': (0, 520, 1792, 2390), 'phere': None, 'reception': (0, 398, 1376, 2846)}
# Segmentation model per image. isnet-anime suits caricatures; u2net_human_seg works
# better when the couple fills the frame (Haldi).
MODELS = {'haldi': 'u2net_human_seg', 'sangeet': 'isnet-anime', 'phere': 'isnet-anime', 'reception': 'isnet-anime'}

def save_webp(img, path, q):
    img.save(path, 'WEBP', quality=q, method=6)
    print(f'  {os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB')

def gate():
    g = np.array(Image.open(os.path.join(SRC, 'gate.png')).convert('RGB')).astype(np.float32)
    cx = 853  # door centre line in the original art

    def mirror_fix(box):  # cover a signboard with the mirrored patch from the other side
        x0, y0, x1, y1 = box
        patch = g[y0:y1, 2 * cx - x1:2 * cx - x0][:, ::-1].copy()
        m = np.zeros((y1 - y0, x1 - x0), np.float32); m[8:-8, 8:-8] = 1
        m = cv2.GaussianBlur(m, (0, 0), 5)[..., None]
        g[y0:y1, x0:x1] = g[y0:y1, x0:x1] * (1 - m) + patch * m

    mirror_fix((344, 1894, 490, 2054))    # left signboard
    mirror_fix((1250, 2026, 1356, 2262))  # right standee
    img = Image.fromarray(np.clip(g[0:2262, 302:1404], 0, 255).astype(np.uint8))
    img = img.resize((WIDTH, round(WIDTH * img.height / img.width)), Image.LANCZOS)
    save_webp(img, os.path.join(OUT, 'gate.webp'), 74)

def event(key, sessions):
    src = Image.open(os.path.join(SRC, key + '.png')).convert('RGB')
    if CROPS[key]: src = src.crop(CROPS[key])
    small = src.copy(); small.thumbnail((1024, 1024))
    mask = remove(small, session=sessions[MODELS[key]], only_mask=True).resize(src.size, Image.LANCZOS)

    w = WIDTH; h = round(w * src.height / src.width)
    s = np.array(src.resize((w, h), Image.LANCZOS))
    m = cv2.resize(np.array(mask).astype(np.float32), (w, h))
    a = np.clip((m - 45) / (210 - 45), 0, 1)

    wm = np.zeros((h, w), np.uint8)  # Gemini sparkle watermark, bottom right
    cv2.circle(wm, (int(w * .925), int(h * .955)), int(w * .04), 255, -1)
    s = cv2.inpaint(s, wm, 7, cv2.INPAINT_TELEA); a[wm > 0] = 0

    fg = Image.fromarray(np.dstack([s, (a * 255).astype(np.uint8)]), 'RGBA')
    hole = cv2.dilate((a > .08).astype(np.uint8), np.ones((25, 25), np.uint8)) * 255
    sm, hm = cv2.resize(s, (w // 3, h // 3)), cv2.resize(hole, (w // 3, h // 3), interpolation=cv2.INTER_NEAREST)
    filled = cv2.GaussianBlur(cv2.resize(cv2.inpaint(sm, hm, 15, cv2.INPAINT_TELEA), (w, h), interpolation=cv2.INTER_CUBIC), (0, 0), 6)
    k = cv2.GaussianBlur(hole.astype(np.float32) / 255, (0, 0), 6)[..., None]
    bg = Image.fromarray((s * (1 - k) + filled * k).astype(np.uint8))

    save_webp(bg, os.path.join(OUT, key + '_bg.webp'), 70)
    save_webp(fg, os.path.join(OUT, key + '_fg.webp'), 80)
    return [w, h]

if __name__ == '__main__':
    only = sys.argv[1:]
    os.makedirs(OUT, exist_ok=True)
    if not only or 'gate' in only:
        print('gate'); gate()
    keys = [k for k in CROPS if not only or k in only]
    sessions = {m: new_session(m) for m in {MODELS[k] for k in keys}}
    sizes = {}
    for k in keys:
        print(k); sizes[k + '_size'] = event(k, sessions)
    print('\nPaste into js/config.js assets:')
    for k, v in sizes.items(): print(f'    "{k}": {v},')
