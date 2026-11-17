#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh ảnh chia sẻ (Open Graph) 1200x630 -> assets/img/og-image.png

Đây là ảnh hiện ra khi khách dán link lên Zalo / Facebook / Messenger, nên nó
phải khớp bộ nhận diện: nền trời sao tím của trang, biểu tượng la bàn kim nhũ,
tên thương hiệu và câu định vị.

Biểu tượng được VẼ LẠI từ đúng hình học của assets/img/logo-mark.svg chứ không
dán assets/img/logo-mark.png, vì file .png có sẵn nền tím đặc — dán lên nền
gradient sẽ lòi ra một ô vuông phẳng.

Chạy:  python tools/gen-og.py
Cần:   Pillow  (pip install Pillow)
"""

import os
import random
import sys

from PIL import Image, ImageDraw, ImageFont

# Console Windows mặc định là cp1252, in tiếng Việt ra sẽ lỗi encoding
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

W, H = 1200, 630
SS = 4  # hệ số vẽ phóng to rồi thu nhỏ, để cạnh mịn

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "og-image.png")

# --- Màu, lấy đúng token trong assets/css/style.css ---
NIGHT = (0x3B, 0x1D, 0x5D)
MID = (0x2A, 0x18, 0x44)
DEEP = (0x1F, 0x14, 0x30)
GLOW = (0x7A, 0x4A, 0xA6)
GOLD_LIGHT = (0xF0, 0xDB, 0xA8)
GOLD_MID = (0xD9, 0xB9, 0x6F)
GOLD_DARK = (0xAC, 0x8A, 0x3B)
GOLD_DG1 = (0xC3, 0xA2, 0x59)
GOLD_DG2 = (0x8F, 0x6F, 0x2B)
HUB = (0x3A, 0x20, 0x60)
CREAM = (0xF4, 0xE8, 0xC1)
GOLD_600 = (0xC7, 0xA1, 0x4E)

FONTS = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")


def font(name, size):
    path = os.path.join(FONTS, name)
    if not os.path.exists(path):
        sys.exit(f"Không tìm thấy font: {path}")
    return ImageFont.truetype(path, size)


def _glyph_bits(fnt, ch):
    m = fnt.getmask(ch)
    return (m.size, bytes(m)) if m.size[0] else None


def check_glyphs(fnt, text, where):
    """Dừng hẳn nếu font thiếu chữ.

    Không có bước này thì ký tự thiếu hiện ra thành ô vuông rỗng mà script vẫn
    báo thành công — đúng cái bẫy đã làm hỏng bản đầu: Georgia không có Ư/Ơ nên
    "THIÊN LƯƠNG" in ra thành "THIÊN L□□NG".
    Chỉ so bbox là không đủ: chính ô vuông .notdef cũng có bbox. Phải so ảnh
    bitmap của từng ký tự với bitmap của một mã chắc chắn không tồn tại.
    """
    notdef = _glyph_bits(fnt, "")
    missing = sorted({ch for ch in text if ch.strip() and _glyph_bits(fnt, ch) == notdef})
    if missing:
        sys.exit(f"Font cho {where} thiếu ký tự: {''.join(missing)}")


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(size, stops):
    """stops: [(vị trí 0..1, màu), ...] theo chiều dọc."""
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                px[0, y] = lerp(c0, c1, (t - p0) / max(1e-6, p1 - p0))
                break
        else:
            px[0, y] = stops[-1][1]
    return img.resize((w, h))


def diagonal_gradient(size, c0, c1):
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            px[x, y] = lerp(c0, c1, (x / max(1, w - 1) + y / max(1, h - 1)) / 2)
    return img


def draw_background():
    bg = vertical_gradient((W, H), [(0.0, NIGHT), (0.46, MID), (1.0, DEEP)])

    # Quầng sáng tím ở đỉnh, giống radial-gradient trong style.css
    from PIL import ImageOps

    glow = ImageOps.invert(Image.radial_gradient("L"))
    # Khung quầng sáng phải trùm qua đáy ảnh. Nếu nó kết thúc trước y = H thì
    # chỗ kết thúc hiện thành một vệt tối cắt ngang, vì rìa dưới của dải radial
    # vẫn còn sáng chứ chưa về 0.
    gw, gh = 1900, 1560
    top = -gh // 2 - 40
    assert top + gh >= H, "khung quầng sáng không phủ hết chiều cao ảnh"
    glow = glow.resize((gw, gh)).point(lambda v: int(v * 0.60))
    mask = Image.new("L", (W, H), 0)
    mask.paste(glow, (W // 2 - gw // 2, top))
    bg.paste(Image.new("RGB", (W, H), GLOW), (0, 0), mask)

    # Sao — gieo cố định để ảnh dựng lại lần nào cũng y hệt
    rnd = random.Random(20261117)
    d = ImageDraw.Draw(bg)
    tints = [(255, 255, 255), (255, 246, 220), (232, 221, 255), (244, 232, 193)]
    for _ in range(150):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        r = rnd.uniform(0.6, 1.9)
        a = rnd.uniform(0.25, 1.0)
        c = lerp(bg.getpixel((int(x), int(y))), rnd.choice(tints), a)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    return bg


def compass_mark(size):
    """Vẽ lại biểu tượng theo đúng toạ độ viewBox 0 0 100 100 của logo-mark.svg."""
    s = size * SS
    k = s / 100.0  # đổi đơn vị viewBox -> pixel

    def P(pts):
        return [(x * k, y * k) for x, y in pts]

    # Hai nhóm hình, hai dải kim nhũ khác nhau, đúng như gradient lg/dg trong SVG
    m_lg = Image.new("L", (s, s), 0)
    m_dg = Image.new("L", (s, s), 0)
    d_lg, d_dg = ImageDraw.Draw(m_lg), ImageDraw.Draw(m_dg)

    d_lg.rectangle(P([(3, 3), (97, 97)]), outline=255, width=max(1, round(2.6 * k)))
    d_lg.ellipse(P([(11.5, 11.5), (88.5, 88.5)]), outline=255, width=max(1, round(2.2 * k)))

    for pts in [[(50, 7), (55.4, 50), (50, 50)], [(93, 50), (50, 44.6), (50, 50)],
                [(50, 93), (44.6, 50), (50, 50)], [(7, 50), (50, 55.4), (50, 50)]]:
        d_lg.polygon(P(pts), fill=255)

    for pts in [[(68, 32), (52.6, 47.4), (47.4, 52.6)], [(68, 68), (52.6, 52.6), (47.4, 47.4)],
                [(32, 68), (47.4, 52.6), (52.6, 47.4)], [(32, 32), (47.4, 47.4), (52.6, 52.6)],
                [(50, 7), (44.6, 50), (50, 50)], [(93, 50), (50, 55.4), (50, 50)],
                [(50, 93), (55.4, 50), (50, 50)], [(7, 50), (50, 44.6), (50, 50)]]:
        d_dg.polygon(P(pts), fill=255)

    art = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    art.paste(vertical_gradient((s, s), [(0.0, GOLD_LIGHT), (0.55, GOLD_MID), (1.0, GOLD_DARK)]), (0, 0), m_lg)
    art.paste(diagonal_gradient((s, s), GOLD_DG1, GOLD_DG2), (0, 0), m_dg)

    # Trục giữa: chấm tím viền kim nhũ
    d = ImageDraw.Draw(art)
    r = 4.6 * k
    d.ellipse([(50 * k - r, 50 * k - r), (50 * k + r, 50 * k + r)],
              fill=HUB + (255,), outline=GOLD_MID + (255,), width=max(1, round(1.6 * k)))

    return art.resize((size, size), Image.LANCZOS)


def text_tracked(draw, xy, text, fnt, fill, tracking=0, anchor_center=True):
    """Pillow không có letter-spacing, nên vẽ từng ký tự."""
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x, y = xy
    if anchor_center:
        x -= total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += w + tracking
    return total


def gold_text_tracked(base, xy, text, fnt, tracking=0):
    """Chữ tô bằng dải kim nhũ dọc, giống background-clip:text trên web."""
    layer = Image.new("L", base.size, 0)
    d = ImageDraw.Draw(layer)
    text_tracked(d, xy, text, fnt, 255, tracking)
    bbox = layer.getbbox()
    grad = vertical_gradient(base.size, [(0.0, (0xF4, 0xE8, 0xC1)), (0.38, (0xE1, 0xC7, 0x8E)),
                                         (0.70, (0xC7, 0xA1, 0x4E)), (1.0, (0x8C, 0x6A, 0x3C))])
    if bbox:
        top, bot = bbox[1], bbox[3]
        grad = vertical_gradient((base.size[0], max(1, bot - top)),
                                 [(0.0, (0xF4, 0xE8, 0xC1)), (0.38, (0xE1, 0xC7, 0x8E)),
                                  (0.70, (0xC7, 0xA1, 0x4E)), (1.0, (0x8C, 0x6A, 0x3C))])
        full = Image.new("RGB", base.size, (0, 0, 0))
        full.paste(grad, (0, top))
        grad = full
    base.paste(grad, (0, 0), layer)


def diamond(draw, cx, cy, rx, ry, fill):
    """Dấu ✦ của bộ nhận diện. Vẽ tay vì KHÔNG font nào trên Windows có U+2726."""
    draw.polygon([(cx, cy - ry), (cx + rx * 0.42, cy - ry * 0.42), (cx + rx, cy),
                  (cx + rx * 0.42, cy + ry * 0.42), (cx, cy + ry),
                  (cx - rx * 0.42, cy + ry * 0.42), (cx - rx, cy),
                  (cx - rx * 0.42, cy - ry * 0.42)], fill=fill)


def main():
    img = draw_background()
    d = ImageDraw.Draw(img)

    mark = compass_mark(168)
    img.paste(mark, (W // 2 - 84, 56), mark)

    # Times New Roman: nét thanh đậm tương phản, gần bản khắc chữ của logo gốc.
    # KHÔNG dùng Georgia/Bookman/Sylfaen — ba font đó thiếu Ư, Ơ và nhiều chữ có
    # hai dấu (ế, ộ, ị...), in ra sẽ thành ô vuông rỗng.
    f_name = font("timesbd.ttf", 82)
    check_glyphs(f_name, "THIÊN LƯƠNG", "tên thương hiệu")
    gold_text_tracked(img, (W // 2, 244), "THIÊN LƯƠNG", f_name, tracking=18)

    # Đường kẻ mảnh hai bên dấu ✦
    y = 372
    for x0, x1 in [(W // 2 - 250, W // 2 - 26), (W // 2 + 26, W // 2 + 250)]:
        for i in range(x0, x1):
            t = (i - x0) / (x1 - x0)
            a = t if x0 < W // 2 else 1 - t
            d.point((i, y), fill=lerp(img.getpixel((i, y)), GOLD_600, 0.15 + 0.75 * a))
    diamond(d, W // 2, y, 7, 11, GOLD_600)

    f_tag = font("timesi.ttf", 40)
    check_glyphs(f_tag, "Sáng rõ trước mỗi quyết định", "câu định vị")
    text_tracked(d, (W // 2, 398), "Sáng rõ trước mỗi quyết định", f_tag, CREAM)

    f_sub = font("seguisb.ttf", 25)
    sub = "LẬP LÁ SỐ TỬ VI · TRƯỜNG PHÁI VIỆT NAM"
    check_glyphs(f_sub, sub, "dòng mô tả")
    text_tracked(d, (W // 2, 494), sub, f_sub, GOLD_600, tracking=4)

    f_foot = font("segoeui.ttf", 22)
    foot = "An đủ hơn 110 sao · Lịch âm Việt Nam GMT+7"
    check_glyphs(f_foot, foot, "dòng chân")
    text_tracked(d, (W // 2, 545), foot, f_foot, (0xC8, 0xBE, 0xDC))

    img.save(OUT, "PNG", optimize=True)
    print(f"Đã tạo {OUT} ({os.path.getsize(OUT) // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
