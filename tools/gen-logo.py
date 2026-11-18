#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh bộ logo tròn chân dung Thầy Thiên Lương, nền TÍM thương hiệu, nền ngoài trong suốt.

Nguồn:  tools/logo-src/logo-chan-dung-goc.png  (1280x1280, nền đĩa xanh navy,
        bên ngoài đĩa là nền nâu xám đặc của ảnh gốc)
Ra:     assets/img/logo-tuvithienluong-tim-{128,256,1024,master}.png
        assets/img/logo-tuvithienluong-tim-512.webp
        assets/img/favicon.ico
        assets/img/apple-touch-icon.png

Chạy:  python tools/gen-logo.py
Cần:   Pillow  (pip install Pillow)

Vì sao phải đổi màu bằng script chứ không tô đè một lớp tím:
  Hình là nét kim nhũ vẽ trên nền navy, nên mỗi điểm ảnh ở rìa nét là một phép
  trộn  p = a*vàng + (1-a)*navy.  Tô đè sẽ ám tím cả nét vàng lẫn ảnh chân dung.
  Script ước lượng phần navy trong từng điểm ảnh rồi cộng đúng hiệu
  (tím - navy) vào:  p' = p + t*(TIM - NAVY).  Với t = tỉ lệ navy thật thì
  p' = a*vàng + (1-a)*tím — nét vàng giữ nguyên màu, chỉ nền đổi.

  t ước lượng theo độ sáng: navy rất tối (L=32), kim nhũ sáng (L=169), nên
  t = 1 - (L - L_navy) / (L_vàng - L_navy)  đúng tuyến tính với phép trộn trên.
  Riêng vùng ảnh chân dung cũng sáng nên công thức đó sẽ bôi tím lên tóc/áo —
  vì vậy vùng chân dung được tách ra bằng mặt nạ và loại khỏi phép đổi màu.
"""

import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "logo-src", "logo-chan-dung-goc.png")
IMG = os.path.join(ROOT, "assets", "img")

# --- Màu, lấy đúng token trong assets/css/style.css ---
NAVY = (0x13, 0x22, 0x39)   # nền đĩa của ảnh gốc (đo được, #132239)
TIM = (0x3B, 0x1D, 0x5D)    # --tl-night / --tl-purple-800 của bộ nhận diện
GOLD = (0xC9, 0xA5, 0x6B)   # --tl-gold-500, màu nét kim nhũ trong logo

# Hình tròn trong ảnh gốc, đo bằng cách quét biên vùng không phải nền nâu xám
CX, CY, R = 640.0, 644.0, 542.0


def luma(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def portrait_mask(rgb):
    """Mặt nạ vùng ảnh chân dung (tóc, da, áo) — phần KHÔNG được đổi màu.

    Chân dung và nét kim nhũ đều là màu ấm (R > B), nền navy là màu lạnh.
    Khác nhau ở bề dày: nét kim nhũ mảnh, chân dung là một khối lớn liền mạch.
    Nên: lấy toàn bộ vùng ấm -> co vào (MinFilter) cho đứt hết nét mảnh ->
    nở ra lại (MaxFilter) để khối chân dung trở về đúng kích thước.

    Chữ "TỬ VI THIÊN LƯƠNG" nét dày nên sống sót một phần qua bước co — không
    sao: nét vàng vốn có t = 0, nằm trong hay ngoài mặt nạ đều giữ nguyên màu.

    Bước cuối lấp lỗ bên trong khối chân dung. Thiếu nó thì mấy hạt chuỗi màu
    đen trên cổ tay (không ấm, không lạnh) lọt ra ngoài mặt nạ và bị ám tím.
    """
    r, g, b = rgb.split()
    warm = ImageChops.subtract(r, b, scale=1, offset=0)      # R - B, cắt ở 0
    warm = warm.point(lambda v: 255 if v > 8 else 0)
    # Nền nâu xám ngoài hình tròn cũng là màu ấm -> xoá đi, nếu không nó dính
    # vào vành đĩa và chặn luôn bước lấp lỗ (lấp lỗ cần biên ảnh là nền).
    warm.paste(0, (0, 0) + warm.size, ImageChops.invert(circle_alpha(warm.size)))
    warm = warm.filter(ImageFilter.MinFilter(21))            # co ~10px, đứt nét mảnh
    warm = warm.filter(ImageFilter.MaxFilter(25))            # nở lại ~12px
    return fill_holes(warm).filter(ImageFilter.GaussianBlur(1.5))   # lấp lỗ, mép mềm


def fill_holes(mask):
    """Lấp mọi vùng 0 bị bao kín bởi vùng 255 (loang từ biên ảnh vào)."""
    outside = mask.point(lambda v: 0 if v > 127 else 255)
    ImageDraw.floodfill(outside, (0, 0), 128)                # 255 còn lại = lỗ kín
    holes = outside.point(lambda v: 255 if v == 255 else 0)
    return ImageChops.lighter(mask, holes)


def recolor(rgb):
    """Đổi nền navy -> tím, giữ nguyên nét kim nhũ và ảnh chân dung."""
    l_navy, l_gold = luma(NAVY), luma(GOLD)
    lut = [max(0, min(255, round(255 * (1 - (v - l_navy) / (l_gold - l_navy))))) for v in range(256)]
    t = rgb.convert("L").point(lut)                          # tỉ lệ navy, 0..255

    keep = portrait_mask(rgb)                                # 255 ở vùng chân dung
    t = ImageChops.subtract(t, keep)                         # trong chân dung -> 0

    bands = []
    for ch, d in zip(rgb.split(), (TIM[i] - NAVY[i] for i in range(3))):
        shift = t.point(lambda v, d=abs(d): round(v * d / 255))
        bands.append(ImageChops.add(ch, shift) if d >= 0 else ImageChops.subtract(ch, shift))
    return Image.merge("RGB", bands)


def circle_alpha(size, ss=4):
    """Alpha hình tròn, vẽ ở độ phân giải x4 rồi thu nhỏ để rìa mịn."""
    w, h = size
    big = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(big).ellipse(
        [(CX - R) * ss, (CY - R) * ss, (CX + R) * ss, (CY + R) * ss], fill=255)
    return big.resize((w, h), Image.LANCZOS)


def save_png(img, name, size):
    out = img.resize((size, size), Image.LANCZOS)
    path = os.path.join(IMG, name)
    out.save(path, "PNG", optimize=True)
    print(f"  {name:38s} {size:4d}px  {os.path.getsize(path) // 1024:4d} KB")
    return out


def main():
    if not os.path.exists(SRC):
        sys.exit(f"Không tìm thấy ảnh gốc: {SRC}")

    src = Image.open(SRC).convert("RGB")
    if src.size != (1280, 1280):
        sys.exit(f"Ảnh gốc phải là 1280x1280, đang là {src.size}")

    tim = recolor(src)
    tim.putalpha(circle_alpha(src.size))

    # Cắt sát hình tròn: bỏ viền trống để logo ở mọi cỡ đều đầy khung
    box = (round(CX - R), round(CY - R), round(CX + R), round(CY + R))
    master = tim.crop(box)                                    # 1084x1084
    print(f"Logo tím, nền ngoài trong suốt — {master.size[0]}px gốc")

    os.makedirs(IMG, exist_ok=True)
    master.save(os.path.join(IMG, "logo-tuvithienluong-tim-master.png"), "PNG", optimize=True)
    print(f"  {'logo-tuvithienluong-tim-master.png':38s} {master.size[0]:4d}px"
          f"  {os.path.getsize(os.path.join(IMG, 'logo-tuvithienluong-tim-master.png')) // 1024:4d} KB")

    save_png(master, "logo-tuvithienluong-tim-1024.png", 1024)
    save_png(master, "logo-tuvithienluong-tim-256.png", 256)
    save_png(master, "logo-tuvithienluong-tim-128.png", 128)
    save_png(master, "apple-touch-icon.png", 180)

    w512 = master.resize((512, 512), Image.LANCZOS)
    p512 = os.path.join(IMG, "logo-tuvithienluong-tim-512.webp")
    w512.save(p512, "WEBP", quality=90, method=6)
    print(f"  {'logo-tuvithienluong-tim-512.webp':38s}  512px  {os.path.getsize(p512) // 1024:4d} KB")

    ico = os.path.join(IMG, "favicon.ico")
    master.resize((64, 64), Image.LANCZOS).save(
        ico, "ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)])
    print(f"  {'favicon.ico':38s} 16-64px  {os.path.getsize(ico) // 1024:4d} KB")


if __name__ == "__main__":
    main()
