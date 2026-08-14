"""Render photoreal light plates for the hero composition.

light-beam.jpg  volumetric crepuscular rays from a top source, on black
                (ships cheap as JPEG; `screen` blending makes black vanish)
dust.png        sparse drifting bokeh motes, transparent
glint.png       small anamorphic star glint for the laurel, transparent
"""

import numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(7)


def value_noise_1d(x, freq, seed):
    """Periodic 1D value noise sampled at x (radians scaled arbitrary)."""
    r = np.random.default_rng(seed)
    grid = r.random(int(freq)) * 2 - 1
    xi = (x * freq / (2 * np.pi)) % freq
    i0 = np.floor(xi).astype(int) % int(freq)
    i1 = (i0 + 1) % int(freq)
    t = xi - np.floor(xi)
    t = t * t * (3 - 2 * t)
    return grid[i0] * (1 - t) + grid[i1] * t


def fbm_angle(ang, octaves, base_freq, seed):
    out = np.zeros_like(ang)
    amp, freq, total = 1.0, base_freq, 0.0
    for o in range(octaves):
        out += amp * value_noise_1d(ang, freq, seed + o)
        total += amp
        amp *= 0.55
        freq *= 2.1
    return out / total


# --- Volumetric beam plate ---------------------------------------------------
W, H = 1400, 1400
sx, sy = W * 0.5, -H * 0.22  # source above the frame
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
dx, dy = xx - sx, yy - sy
rad = np.hypot(dx, dy)
ang = np.arctan2(dx, dy)  # 0 points straight down

channels = []
for c, dang in enumerate((-0.0025, 0.0, 0.0025)):  # chromatic offset per channel
    a = ang + dang
    streaks = 0.5 + 0.5 * fbm_angle(a, 5, 48, seed=11)
    fine = 0.5 + 0.5 * fbm_angle(a, 4, 210, seed=97)
    rays = np.clip(streaks, 0, 1) ** 2.2 * (0.55 + 0.45 * fine)
    # slight variation along the radius so rays read as haze, not spokes
    depth = 0.82 + 0.18 * (0.5 + 0.5 * value_noise_1d(a * 3 + rad * 0.004, 64, 5))
    envelope = np.exp(-((np.abs(ang) / 0.62) ** 2.4))  # cone width
    falloff = np.exp(-rad / (H * 0.72)) * np.clip(rad / 80, 0, 1)
    core = np.exp(-rad / (H * 0.20)) * 0.65
    channels.append(rays * depth * envelope * falloff + core * envelope)

beam = np.stack(channels, axis=-1)
beam /= beam.max()
beam = beam**1.15

# warm color ramp that desaturates toward white in the highlights
base = np.array([1.0, 0.78, 0.5])
white = np.array([1.0, 0.97, 0.9])
lum = beam.mean(axis=2, keepdims=True)
color = beam * base + (lum**2.4) * (white - base)
color += rng.normal(0, 0.008, color.shape)  # grain
img = Image.fromarray((np.clip(color, 0, 1) * 255).astype(np.uint8))
img = img.filter(ImageFilter.GaussianBlur(1.1))
img.save("light-beam.jpg", quality=86)

# --- Dust motes ---------------------------------------------------------------
DW, DH = 900, 1300
dust = np.zeros((DH, DW), dtype=np.float64)
for _ in range(70):
    x, y = rng.integers(0, DW), rng.integers(0, DH)
    r = rng.uniform(1.0, 4.5)
    a = rng.uniform(0.25, 1.0)
    yy, xx = np.mgrid[max(0, y - 20) : min(DH, y + 20), max(0, x - 20) : min(DW, x + 20)]
    d2 = (xx - x) ** 2 + (yy - y) ** 2
    dust[max(0, y - 20) : min(DH, y + 20), max(0, x - 20) : min(DW, x + 20)] += a * np.exp(
        -d2 / (2 * r * r)
    )
dust_img = Image.fromarray((np.clip(dust, 0, 1) * 255).astype(np.uint8), "L")
blurred = dust_img.filter(ImageFilter.GaussianBlur(2.5))
dust_img = Image.blend(dust_img, blurred, 0.55)
rgba = Image.merge(
    "RGBA",
    (
        Image.new("L", dust_img.size, 255),
        Image.new("L", dust_img.size, 243),
        Image.new("L", dust_img.size, 214),
        dust_img,
    ),
)
rgba.save("dust.png", optimize=True)

# --- Anamorphic glint ----------------------------------------------------------
GS = 240
yy, xx = np.mgrid[0:GS, 0:GS].astype(np.float64) - GS / 2
r2 = np.hypot(xx, yy)
glint = np.exp(-r2 / 9) + 0.6 * np.exp(-((np.abs(yy) / 1.6) ** 2) - np.abs(xx) / 55)
glint += 0.35 * np.exp(-((np.abs(xx) / 1.6) ** 2) - np.abs(yy) / 34)
glint = np.clip(glint / glint.max(), 0, 1)
g_rgba = Image.merge(
    "RGBA",
    (
        Image.new("L", (GS, GS), 255),
        Image.new("L", (GS, GS), 240),
        Image.new("L", (GS, GS), 200),
        Image.fromarray((glint * 255).astype(np.uint8), "L"),
    ),
)
g_rgba.save("glint.png", optimize=True)

print("done")
