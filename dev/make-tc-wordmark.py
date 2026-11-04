#!/usr/bin/env python3
"""dev/make-tc-wordmark.py — trace the provisional TC wordmark to SVG paths.

The in-app wordmark is a CSS mask (`.logo-img` in frontend/css/style.css). A mask image is loaded
as a standalone image, so an SVG with <text> cannot reach the app's @font-face and falls back to
whatever monospace the OS has. This script bakes the VT323 glyphs (frontend/assets/fonts/vt323.woff2)
into real <path> outlines so the mark renders identically everywhere, and writes two files:

  frontend/assets/brand/tc-wordmark.svg   two-line mark for the topbar mask (and setup screens)
  frontend/assets/brand/tc-logo.svg       one-line big mark for the splash screen (<img>)

Both are PROVISIONAL: replace them with Jerome's definitive mark when it exists (any single-colour
SVG works; only the silhouette matters for the mask). Run from the repo root:

  python3 dev/make-tc-wordmark.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'frontend/assets/fonts/vt323.woff2'
OUT = ROOT / 'frontend/assets/brand'

font = TTFont(FONT)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
upem = font['head'].unitsPerEm
ascent = font['hhea'].ascent


def line_path(text, size, x, y, tracking=0.0):
    """Outline `text` at `size` px with its baseline at (x, y). Returns (path d, advance width)."""
    scale = size / upem
    pen = SVGPathPen(glyphs)
    cursor = x
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            cursor += size * 0.5 + tracking
            continue
        g = glyphs[name]
        # font units -> px, flip y (SVG y grows downward)
        tp = TransformPen(pen, (scale, 0, 0, -scale, cursor, y))
        g.draw(tp)
        cursor += g.width * scale + tracking
    return pen.getCommands(), cursor - x


def svg(width, height, label, paths, comment):
    body = ''.join(f'\n  <path d="{d}"/>' for d in paths if d)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
            f'role="img" aria-label="{label}">\n  <!-- {comment} -->\n  <title>{label}</title>\n'
            f'  <g fill="#dfe9f5">{body}\n  </g>\n</svg>\n')


# --- topbar wordmark: ONE line, tight box (a second line is unreadable at 30px) ------------------
d1, w1 = line_path('TRIBUNA CENTRAL', 80, 0, 64, tracking=2)
W = int(w1) + 4
(OUT / 'tc-wordmark.svg').write_text(svg(W, 80, 'Tribuna Central 2.0 Offices', [d1],
    'Provisional wordmark, VT323 glyphs baked to paths by dev/make-tc-wordmark.py. Used as a CSS mask '
    '(only the silhouette counts). Replace with the definitive mark from Jerome.'))
print('tc-wordmark.svg', W, 'x 80')

# --- splash logo: framed, three lines, centred ---------------------------------------------------
d_a, w_a = line_path('TRIBUNA CENTRAL', 104, 0, 0, tracking=4)
d_b, w_b = line_path('2.0 OFFICES', 58, 0, 0, tracking=12)
d_c, w_c = line_path('REDACCIÓN DIGITAL', 26, 0, 0, tracking=8)
# re-run with centred x so the paths land in place (cheaper than a transform wrapper)
d_a, _ = line_path('TRIBUNA CENTRAL', 104, (900 - w_a) / 2, 128, tracking=4)
d_b, _ = line_path('2.0 OFFICES', 58, (900 - w_b) / 2, 206, tracking=12)
d_c, _ = line_path('REDACCIÓN DIGITAL', 26, (900 - w_c) / 2, 250, tracking=8)
frame = ('<g fill="none" stroke="#dfe9f5" stroke-width="6"><rect x="18" y="18" width="864" height="264" rx="6"/>'
         '<rect x="34" y="34" width="832" height="232" rx="4" stroke-opacity="0.35" stroke-width="2"/></g>')
logo = svg(900, 300, 'Tribuna Central 2.0 Offices', [d_a, d_b],
    'Provisional splash logo, VT323 glyphs baked to paths by dev/make-tc-wordmark.py. Replace with the '
    'definitive logo from Jerome.')
logo = logo.replace('  <g fill="#dfe9f5">', '  ' + frame + '\n  <g fill="#dfe9f5">')
logo = logo.replace('\n  </g>\n</svg>', f'\n  </g>\n  <g fill="#dfe9f5" fill-opacity="0.7"><path d="{d_c}"/></g>\n</svg>')
(OUT / 'tc-logo.svg').write_text(logo)
print('tc-logo.svg 900 x 300')
