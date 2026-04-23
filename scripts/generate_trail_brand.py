#!/usr/bin/env python3
"""Generate polished Trail brand assets for PawnTrail.

Deliverables:
  - trail-mark.png           raw mark on transparent, 1600x1600
  - trail-concept-card.png   full concept card, 1600x1100
  - trail-lockup-horizontal.png  mark + wordmark, transparent
  - trail-favicon-{512,128,64,32,16}.png  rounded-square favicon
"""

import os
import io
import cairosvg
from PIL import Image, ImageDraw, ImageFont

OUT = "/sessions/optimistic-awesome-mccarthy/mnt/pawntrail/brand"
os.makedirs(OUT, exist_ok=True)

FOREST = "#1F3A2E"
CREAM = "#F4EDDC"
AMBER = "#C77F3A"
INK = "#14201A"

# ---------- Trail mark geometry (canvas 1200x1200) ----------
# Two-step cartographic tour: start -> mid waypoint -> end target
# The two "knight-like" L-moves stair-step diagonally up and to the right,
# keeping the mark square (640x640 inside a 1200x1200 canvas).
START = (280, 920)
COR1 = (280, 600)
MID = (600, 600)
COR2 = (600, 280)
END = (920, 280)


def trail_svg(tight=True):
    """SVG for the primary Trail mark. If tight, crops tightly around the mark.

    The dashed path is drawn as two separate polylines — one per "leg" of the
    journey — each trimmed at the waypoint boundary so the dashes stop cleanly
    at each rest stop rather than bumping into the circle.
    """
    vb = "200 200 800 800" if tight else "0 0 1200 1200"
    # Segment 1 (START -> COR1 -> MID), trimmed 60px off the start and 52px off the end
    # Segment 2 (MID -> COR2 -> END), trimmed 52px off the start and 82px off the end
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">
  <polyline points="280,830 280,600 518,600"
            fill="none" stroke="{FOREST}" stroke-width="22"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="0 66"/>
  <polyline points="600,518 600,280 808,280"
            fill="none" stroke="{FOREST}" stroke-width="22"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="0 66"/>
  <circle cx="{START[0]}" cy="{START[1]}" r="50" fill="{FOREST}"/>
  <circle cx="{MID[0]}" cy="{MID[1]}" r="42" fill="{FOREST}"/>
  <circle cx="{MID[0]}" cy="{MID[1]}" r="18" fill="{CREAM}"/>
  <circle cx="{END[0]}" cy="{END[1]}" r="72" fill="{AMBER}"/>
  <circle cx="{END[0]}" cy="{END[1]}" r="32" fill="{CREAM}"/>
</svg>'''


def favicon_svg(size=512):
    """Simplified favicon — forest rounded-square, single cream L, amber target."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="{size}" height="{size}">
  <rect x="0" y="0" width="512" height="512" rx="88" ry="88" fill="{FOREST}"/>
  <polyline points="150,380 150,200 360,200"
            fill="none" stroke="{CREAM}" stroke-width="30"
            stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="150" cy="380" r="32" fill="{CREAM}"/>
  <circle cx="360" cy="200" r="46" fill="{AMBER}"/>
  <circle cx="360" cy="200" r="20" fill="{CREAM}"/>
</svg>'''


def svg_to_pil(svg, out_w, out_h):
    png_bytes = cairosvg.svg2png(
        bytestring=svg.encode("utf-8"),
        output_width=out_w,
        output_height=out_h,
    )
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


# ---------- Font lookup ----------
LATO_MEDIUM = "/usr/share/fonts/truetype/lato/Lato-Medium.ttf"
LATO_BLACK = "/usr/share/fonts/truetype/lato/Lato-Black.ttf"
LATO_LIGHT = "/usr/share/fonts/truetype/lato/Lato-Light.ttf"
LORA_ITALIC = "/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf"
DEJAVU_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def font(path, size):
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


# ---------- 1. Raw mark on transparent ----------
def make_raw_mark():
    img = svg_to_pil(trail_svg(tight=True), 1600, 1600)
    img.save(os.path.join(OUT, "trail-mark.png"))
    print("✓ trail-mark.png (1600x1600, transparent)")


# ---------- 2. Concept card ----------
def make_concept_card():
    W, H = 1600, 1100
    canvas = Image.new("RGB", (W, H), hex_rgb(CREAM))
    draw = ImageDraw.Draw(canvas)
    ink = hex_rgb(INK)
    forest = hex_rgb(FOREST)

    # Registration corner marks (thin, vintage blueprint feel)
    m, cl, cw = 40, 40, 1
    for (x, y, hx, hy) in [
        (m, m, 1, 1),
        (W - m, m, -1, 1),
        (m, H - m, 1, -1),
        (W - m, H - m, -1, -1),
    ]:
        draw.line([(x, y), (x + hx * cl, y)], fill=ink, width=cw)
        draw.line([(x, y), (x, y + hy * cl)], fill=ink, width=cw)

    # Top-left: concept tag
    mono_lg = font(DEJAVU_MONO, 20)
    draw.text((m + 60, m - 2), "03 · TRAIL", font=mono_lg, fill=ink)

    # Top-right: project strip
    sans_sm = font(LATO_MEDIUM, 16)
    label = "PAWNTRAIL  /  CARTOGRAPHIC PRECISION"
    lbox = draw.textbbox((0, 0), label, font=sans_sm)
    draw.text((W - m - 60 - (lbox[2] - lbox[0]), m - 2), label, font=sans_sm, fill=ink)

    # Primary mark (centered, ~540px)
    mark_h = 540
    mark = svg_to_pil(trail_svg(tight=True), mark_h, mark_h)
    mark_x = (W - mark_h) // 2
    mark_y = 170
    canvas.paste(mark, (mark_x, mark_y), mark)

    # Wordmark with manual letter-spacing
    wm_font = font(LATO_MEDIUM, 54)
    wordmark = "P A W N T R A I L"
    wbox = draw.textbbox((0, 0), wordmark, font=wm_font)
    wm_y = mark_y + mark_h + 90
    draw.text(((W - (wbox[2] - wbox[0])) // 2, wm_y), wordmark, font=wm_font, fill=forest)

    # Tagline in serif italic
    serif = font(LORA_ITALIC, 26)
    tagline = "Snap the scoresheet. Chart the trail."
    tbox = draw.textbbox((0, 0), tagline, font=serif)
    tl_y = wm_y + 90
    draw.text(((W - (tbox[2] - tbox[0])) // 2, tl_y), tagline, font=serif, fill=ink)

    # Palette swatches, bottom-left
    sw_x = m + 60
    sw_y = H - m - 90
    sw_s = 36
    swatches = [
        (FOREST, "FOREST  #1F3A2E"),
        (CREAM, "CREAM   #F4EDDC"),
        (AMBER, "AMBER   #C77F3A"),
        (INK, "INK     #14201A"),
    ]
    sw_mono = font(DEJAVU_MONO, 13)
    col_w = 230
    for i, (c, cap) in enumerate(swatches):
        x = sw_x + i * col_w
        draw.rectangle([x, sw_y, x + sw_s, sw_y + sw_s], fill=hex_rgb(c), outline=ink, width=1)
        draw.text((x + sw_s + 10, sw_y + 10), cap, font=sw_mono, fill=ink)

    # Small-scale mark (bottom-right) at 80px
    small_mark = svg_to_pil(trail_svg(tight=True), 80, 80)
    canvas.paste(small_mark, (W - m - 60 - 80, H - m - 60 - 80), small_mark)

    # Subtle center-line registration (dry, cartographic)
    draw.line([(W // 2, m + 55), (W // 2, m + 75)], fill=ink, width=1)
    draw.line([(W // 2 - 8, m + 65), (W // 2 + 8, m + 65)], fill=ink, width=1)

    canvas.save(os.path.join(OUT, "trail-concept-card.png"))
    print("✓ trail-concept-card.png (1600x1100)")


# ---------- 3. Horizontal lockup ----------
def make_horizontal_lockup():
    """Mark (left) + wordmark (right), with a thin rule between. Transparent."""
    H = 400
    mark_size = 320
    mark_pad = 60

    # Render mark first
    mark = svg_to_pil(trail_svg(tight=True), mark_size, mark_size)

    # Measure wordmark to size the canvas
    wm_font = font(LATO_MEDIUM, 130)
    text = "pawntrail"  # lowercase editorial, softer than all-caps
    # Manual letter-spacing: render each char with tracking
    tmp = Image.new("RGBA", (10, 10))
    tdraw = ImageDraw.Draw(tmp)

    tracking = 8  # px between letters
    letters = list(text)
    char_widths = []
    for ch in letters:
        bb = tdraw.textbbox((0, 0), ch, font=wm_font)
        char_widths.append(bb[2] - bb[0])
    total_text_w = sum(char_widths) + tracking * (len(letters) - 1)

    # Canvas width: left pad + mark + gap + divider + gap + text + right pad
    gap_before_rule = 48
    gap_after_rule = 48
    right_pad = 60
    W = mark_pad + mark_size + gap_before_rule + 2 + gap_after_rule + total_text_w + right_pad

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # Mark
    mark_y = (H - mark_size) // 2
    canvas.paste(mark, (mark_pad, mark_y), mark)

    # Thin vertical rule
    rule_x = mark_pad + mark_size + gap_before_rule
    draw.line([(rule_x, mark_y + 40), (rule_x, mark_y + mark_size - 40)], fill=hex_rgb(FOREST), width=1)

    # Wordmark
    x = rule_x + 2 + gap_after_rule
    # vertical center baseline
    sample_bb = draw.textbbox((0, 0), text, font=wm_font)
    text_h = sample_bb[3] - sample_bb[1]
    y = (H - text_h) // 2 - sample_bb[1]
    for ch, cw in zip(letters, char_widths):
        draw.text((x, y), ch, font=wm_font, fill=hex_rgb(FOREST))
        x += cw + tracking

    # Amber dot as "period" at the end
    dot_r = 10
    dot_x = x - tracking + 4
    dot_y = y + text_h - dot_r
    # place dot at baseline
    sample_bb_full = draw.textbbox((0, 0), text, font=wm_font)
    baseline_y = mark_y + mark_size - 50  # align roughly with baseline of letters
    # Better: derive baseline from last letter
    last_bb = draw.textbbox((0, 0), letters[-1], font=wm_font)
    # Draw amber dot slightly below baseline
    draw.ellipse(
        [
            x - tracking + 2,
            y + text_h - 14,
            x - tracking + 2 + dot_r * 2,
            y + text_h - 14 + dot_r * 2,
        ],
        fill=hex_rgb(AMBER),
    )

    canvas.save(os.path.join(OUT, "trail-lockup-horizontal.png"))
    print(f"✓ trail-lockup-horizontal.png ({W}x{H}, transparent)")


# ---------- 4. Favicons ----------
def make_favicons():
    for size in (512, 256, 128, 64, 32, 16):
        img = svg_to_pil(favicon_svg(size), size, size)
        img.save(os.path.join(OUT, f"trail-favicon-{size}.png"))
        print(f"✓ trail-favicon-{size}.png")


if __name__ == "__main__":
    make_raw_mark()
    make_concept_card()
    make_horizontal_lockup()
    make_favicons()
    print("\nAll assets written to:", OUT)
