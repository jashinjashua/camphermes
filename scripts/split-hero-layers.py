"""Split the posterized hero artwork into layers by pixel values.

Outputs, aligned to the same canvas:
  hero-figure.png  RGBA figure cutout (background removed)
  hero-bg.jpg      the original frame, used as the ambient bottom layer
  mask-wings.png   grayscale masks for material-specific light passes
  mask-skin.png
  mask-metal.png
  mask-gold.png
"""

import numpy as np
from PIL import Image, ImageFilter

SRC = "src/assets/hero/source.png"

img = np.array(Image.open(SRC).convert("RGB")).astype(np.int16)
h, w, _ = img.shape
r, g, b = img[..., 0], img[..., 1], img[..., 2]
mx = img.max(axis=2)


def dilate(m, n=1):
    out = m.copy()
    for _ in range(n):
        grown = out.copy()
        grown[1:, :] |= out[:-1, :]
        grown[:-1, :] |= out[1:, :]
        grown[:, 1:] |= out[:, :-1]
        grown[:, :-1] |= out[:, 1:]
        out = grown
    return out


def erode(m, n=1):
    return ~dilate(~m, n)


# --- Background: flood fill dark pixels from the border ---------------------
dark = mx < 110
seed = np.zeros_like(dark)
seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
seed &= dark
prev = 0
while True:
    grown = dilate(seed, 8) & dark
    count = int(grown.sum())
    if count == prev:
        break
    prev, seed = count, grown

# The outline network is dark and touches the background at the silhouette,
# so the flood leaks along thin lines. Opening removes anything thinner than
# ~2*OPEN px from the background mask, which returns outlines to the figure.
OPEN = 5
bg = dilate(erode(seed, OPEN), OPEN)
figure = ~bg

# Drop stray figure specks in the background and feather the cutout edge.
figure = erode(dilate(figure, 2), 2)
alpha = Image.fromarray((figure * 255).astype(np.uint8), "L").filter(
    ImageFilter.GaussianBlur(1.2)
)

rgba = Image.merge(
    "RGBA", (*Image.fromarray(img.astype(np.uint8)).split(), alpha)
)
rgba.save("hero-figure.png", optimize=True)

Image.fromarray(img.astype(np.uint8)).save("hero-bg.jpg", quality=88)

# --- Material masks within the figure ---------------------------------------
fig = figure

skin = fig & (r > 190) & (g > 140) & (b > 90) & (b < 215) & (g - b < 90)
wings = fig & (r > 170) & (g < 175) & (b < 115) & ((r - b) > 90) & ~skin
gold = fig & (r > 200) & (g > 165) & (b < 120) & ((g - b) > 70)
wings &= ~gold
metal = fig & (mx > 85) & (abs(r - g) < 26) & (abs(g - b) < 40) & (b >= r - 6)

for name, mask in [
    ("mask-wings", wings),
    ("mask-skin", skin),
    ("mask-metal", metal),
    ("mask-gold", gold),
]:
    m = Image.fromarray((mask * 255).astype(np.uint8), "L").filter(
        ImageFilter.GaussianBlur(2)
    )
    m.save(f"{name}.png", optimize=True)
    print(name, f"{mask.mean() * 100:.1f}% of frame")

print("figure", f"{figure.mean() * 100:.1f}% of frame")
