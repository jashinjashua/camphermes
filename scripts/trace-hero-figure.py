"""Trace the hero artwork into public/hero/figure.svg.

Uses potrace (the engine behind Inkscape's Trace Bitmap) with its Trace
Bitmap parameters: Speckles = turdsize, Smooth corners = alphamax,
Optimize paths = opttolerance. The figure mask is the source PNG's alpha
channel, quantized to 7 colors; the multicolor scans are stacked like
Inkscape's "stack scans" option so the layers have no hairline seams.

Requires the potrace binary on PATH and pillow + numpy.
"""

import re
import subprocess

import numpy as np
from PIL import Image

SRC = "src/assets/hero/source.png"
OUT = "public/hero/figure.svg"
N_COLORS = 7
TURDSIZE, ALPHAMAX, OPTTOL = 25, 1.334, 1.2

rgba = np.array(Image.open(SRC).convert("RGBA"))
h, w, _ = rgba.shape
img, alpha = rgba[..., :3], rgba[..., 3]
figure = alpha > 200

# Quantize the figure pixels to N colors
sample = Image.fromarray(img[figure].reshape(-1, 1, 3), "RGB")
pal = sample.quantize(colors=N_COLORS, method=Image.Quantize.MEDIANCUT, kmeans=3)
palette = np.array(pal.getpalette()[: N_COLORS * 3], dtype=np.uint8).reshape(-1, 3)
flat = img.reshape(-1, 3).astype(np.int32)
dists = ((flat[:, None, :] - palette[None, :, :].astype(np.int32)) ** 2).sum(axis=2)
quant = palette[dists.argmin(axis=1)].reshape(h, w, 3)

masks = {tuple(c): figure & (quant == np.array(c)).all(axis=2) for c in palette.tolist()}
order = sorted(masks, key=lambda c: -masks[c].sum())


def trace(mask: np.ndarray) -> str:
    pbm = f"P4\n{w} {h}\n".encode() + np.packbits(mask, axis=1).tobytes()
    run = subprocess.run(
        ["potrace", "-s", "-t", str(TURDSIZE), "-a", str(ALPHAMAX), "-O", str(OPTTOL),
         "-o", "-", "-"],
        input=pbm, capture_output=True, check=True,
    )
    return run.stdout.decode()


parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">']
stacked = np.zeros((h, w), dtype=bool)
layers = []
for color in reversed(order):
    stacked |= masks[color]
    layers.append((color, stacked.copy()))
layers.reverse()

for color, mask in layers:
    svg = trace(mask)
    body = re.search(r"<g[^>]*>(.*)</g>", svg, re.S)
    if not body:
        continue
    fill = "#{:02x}{:02x}{:02x}".format(*color)
    tr = re.search(r'transform="([^"]+)"', svg)
    parts.append(
        f'<g transform="{tr.group(1)}">' if tr else "<g>"
    )
    parts.append(re.sub(r"<path", f'<path fill="{fill}"', body.group(1)))
    parts.append("</g>")
parts.append("</svg>")

out = "".join(parts)
open(OUT, "w").write(out)
nodes = sum(len(re.findall(r"[MLCQTSAmlcqtsa]", d)) for d in re.findall(r'\sd="([^"]+)"', out))
print(f"{OUT}: {len(re.findall(r'<path', out))} paths, {nodes} nodes, {len(out) // 1024} KB")
