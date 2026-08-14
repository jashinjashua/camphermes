"""Build the hero light-pass layers from the artwork.

Reads src/assets/hero/source.png (RGBA; the background is already
transparent, the figure is the solid-alpha region) and writes:

  src/assets/hero/ambient.jpg   the artwork on the page background color,
                                used as the blurred ambient wash
  public/hero/mask-skin.png     alpha masks for the material light passes,
  public/hero/mask-wings.png    aligned to the artwork canvas
  public/hero/mask-metal.png
  public/hero/mask-gold.png

The figure itself ships as public/hero/figure.svg, traced by
scripts/trace-hero-figure.py from the same source.
"""

import numpy as np
from PIL import Image, ImageFilter

SRC = "src/assets/hero/source.png"
BG = (10, 11, 13)

rgba = np.array(Image.open(SRC).convert("RGBA")).astype(np.int16)
img, alpha = rgba[..., :3], rgba[..., 3]
figure = alpha > 200
r, g, b = img[..., 0], img[..., 1], img[..., 2]
mx = img.max(axis=2)

# Ambient: composite over the page background color
a = (alpha / 255.0)[..., None]
ambient = (img * a + np.array(BG) * (1 - a)).astype(np.uint8)
Image.fromarray(ambient, "RGB").save("src/assets/hero/ambient.jpg", quality=88)

# Material masks. The bright pass covers skin and the white wrap/keyline,
# the wing pass the saturated reds, the metal pass the low-chroma grays.
skin = figure & (r > 190) & (g > 140) & (b > 80)
wings = figure & (r > 170) & (g < 150) & (b < 100) & ((r - b) > 120)
metal = figure & (mx > 85) & (mx < 215) & (abs(r - g) < 25) & (abs(g - b) < 30) & (b >= r - 8)
gold = figure & (r > 180) & ((g - b) > 55) & ((r - g) < 90) & (b < 110)
gold[350:, :] = False
skin &= ~gold

for name, mask in [
    ("mask-skin", skin),
    ("mask-wings", wings),
    ("mask-metal", metal),
    ("mask-gold", gold),
]:
    m = Image.fromarray((mask * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(2))
    white = Image.new("L", m.size, 255)
    # CSS mask-image masks by alpha, so the mask value goes in the alpha channel
    Image.merge("RGBA", (white, white, white, m)).save(f"public/hero/{name}.png", optimize=True)
    print(name, f"{mask.mean() * 100:.1f}% of frame")
