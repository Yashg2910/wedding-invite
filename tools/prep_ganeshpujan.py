"""
Ganesh Pujan layers — a special case.

The caricature is a busy altar scene where ML matting can't cleanly isolate
the idol (it blends into the same-toned table/curtain). So instead of cutting
the idol OUT of the background, we:

  _bg  = the full scene, untouched (watermark cleaned, resized).
  _fg  = a soft, feathered elliptical crop tightly around the Ganesha idol,
         transparent everywhere else.

Because the fg is positioned exactly over its source location in the bg, there
is no "hole" to fill — the fg simply rides on top of the idol so the layer
shader's sway / bob / glitter gives the idol gentle life while the rest of the
decorated mandap stays crisp behind it.

Run:  .venv-assets/bin/python tools/prep_ganeshpujan.py
"""
import os
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source-art', 'ganeshpujan.png')
OUT = os.path.join(ROOT, 'public', 'assets')
WIDTH = 900

# Idol bounding ellipse as fractions of the image (cx, cy, rx, ry).
# Tuned to the crown-to-seat figure sitting on the gold platform.
IDOL = dict(cx=0.52, cy=0.425, rx=0.15, ry=0.155)
FEATHER = 0.055  # soft edge width as a fraction of image width


def save_webp(img, name, q):
    path = os.path.join(OUT, name)
    img.save(path, 'WEBP', quality=q, method=6)
    print(f'  {os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB')


def main():
    src = Image.open(SRC).convert('RGB')
    w = WIDTH
    h = round(w * src.height / src.width)
    s = np.array(src.resize((w, h), Image.LANCZOS))

    # Clean the Gemini sparkle watermark (bottom-right), same as prep_assets.
    wm = np.zeros((h, w), np.uint8)
    cv2.circle(wm, (int(w * .925), int(h * .955)), int(w * .04), 255, -1)
    s = cv2.inpaint(s, wm, 7, cv2.INPAINT_TELEA)

    # --- bg: the full scene ---
    save_webp(Image.fromarray(s), 'ganeshpujan_bg.webp', 72)

    # --- fg: feathered ellipse around the idol ---
    cx, cy = IDOL['cx'] * w, IDOL['cy'] * h
    rx, ry = IDOL['rx'] * w, IDOL['ry'] * h
    yy, xx = np.ogrid[:h, :w]
    # Normalised distance from the ellipse edge (0 inside, grows outside).
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    feather = FEATHER * w / max(rx, ry)
    alpha = np.clip((1.0 - d) / feather + 1.0, 0, 1).astype(np.float32)
    alpha = cv2.GaussianBlur(alpha, (0, 0), w * 0.01)

    fg = Image.fromarray(np.dstack([s, (alpha * 255).astype(np.uint8)]), 'RGBA')
    save_webp(fg, 'ganeshpujan_fg.webp', 82)

    print(f'\n    "ganeshpujan_size": [{w}, {h}],')


if __name__ == '__main__':
    main()
