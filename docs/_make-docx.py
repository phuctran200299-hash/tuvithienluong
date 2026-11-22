# -*- coding: utf-8 -*-
"""Sinh tài liệu đề xuất trang quản trị (DOCX) để gửi khách.
Viết cho chủ website đọc, không dùng từ kỹ thuật; không nói về hạ tầng/triển khai.
Phạm vi: CHỈ các nội dung đang hiển thị trên 2 trang client hiện tại.
Chạy:  py docs/_make-docx.py
"""
import os
from docx import Document
from docx.shared import Pt, Cm, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ROOT, 'img')
OUT = os.path.join(ROOT, 'De-xuat-trang-quan-tri-website-Thien-Luong.docx')

PURPLE = RGBColor(0x5B, 0x2D, 0x8E)
DARK = RGBColor(0x2A, 0x18, 0x44)
GOLD = RGBColor(0x9B, 0x6A, 0x10)
GREY = RGBColor(0x6F, 0x68, 0x89)
FONT = 'Segoe UI'
CONTENT_W = Inches(6.6)

doc = Document()

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.0)
sec.top_margin = Cm(2.0)
sec.bottom_margin = Cm(1.8)


def set_font(style, name=FONT, size=10.5, bold=None, color=None):
    style.font.name = name
    style.font.size = Pt(size)
    if bold is not None:
        style.font.bold = bold
    if color is not None:
        style.font.color.rgb = color
    rpr = style.element.get_or_add_rPr()
    rf = rpr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts')
        rpr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
        rf.set(qn(a), name)


st = doc.styles
set_font(st['Normal'], size=10.5)
st['Normal'].paragraph_format.space_after = Pt(6)
st['Normal'].paragraph_format.line_spacing = 1.18
for nm, sz, col in (('Heading 1', 17, DARK), ('Heading 2', 13.5, PURPLE), ('Heading 3', 11.5, DARK)):
    set_font(st[nm], size=sz, bold=True, color=col)
    st[nm].paragraph_format.space_before = Pt(14 if nm == 'Heading 1' else 10)
    st[nm].paragraph_format.space_after = Pt(6)
    st[nm].paragraph_format.keep_with_next = True
for nm in ('List Bullet', 'List Number'):
    set_font(st[nm], size=10.5)
    st[nm].paragraph_format.space_after = Pt(3)


def _parse(t):
    out, buf, bold = [], '', False
    i = 0
    while i < len(t):
        if t[i:i + 2] == '**':
            if buf:
                out.append((buf, bold))
            buf, bold, i = '', not bold, i + 2
        else:
            buf += t[i]
            i += 1
    if buf:
        out.append((buf, bold))
    return out or [('', False)]


def shade(cell, hexv):
    el = OxmlElement('w:shd')
    el.set(qn('w:val'), 'clear')
    el.set(qn('w:color'), 'auto')
    el.set(qn('w:fill'), hexv)
    cell._tc.get_or_add_tcPr().append(el)


def cell_text(cell, text, bold=False, size=9.3, color=None, align=None):
    cell.text = ''
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.line_spacing = 1.1
    if align:
        p.alignment = align
    for i, line in enumerate(str(text).split('\n')):
        if i:
            p = cell.add_paragraph()
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.1
        for chunk, b in _parse(line):
            r = p.add_run(chunk)
            r.font.size = Pt(size)
            r.font.name = FONT
            r.font.bold = bold or b
            if color is not None:
                r.font.color.rgb = color
    return cell


def H1(t):
    doc.add_heading(t, 1)


def H2(t):
    doc.add_heading(t, 2)


def P(t='', bold=False, size=10.5, color=None, align=None, space=6, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space)
    if align:
        p.alignment = align
    for chunk, b in _parse(t):
        r = p.add_run(chunk)
        r.font.size = Pt(size)
        r.font.name = FONT
        r.bold = bold or b
        r.italic = italic
        if color is not None:
            r.font.color.rgb = color
    return p


def BUL(t):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    for chunk, b in _parse(t):
        r = p.add_run(chunk)
        r.font.size = Pt(10.5)
        r.font.name = FONT
        r.bold = b
    return p


def NUM(t):
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.space_after = Pt(3)
    for chunk, b in _parse(t):
        r = p.add_run(chunk)
        r.font.size = Pt(10.5)
        r.font.name = FONT
        r.bold = b
    return p


def TABLE(headers, rows, widths, size=9.3, header_fill='2A1844'):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    total = sum(widths)
    cm_w = [Cm(17.0 * w / total) for w in widths]
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        cell_text(c, h, bold=True, size=size - 0.3, color=RGBColor(0xFF, 0xFF, 0xFF))
        shade(c, header_fill)
    for r_i, row in enumerate(rows):
        cells = t.add_row().cells
        for i, v in enumerate(row):
            bold = isinstance(v, str) and v.startswith('§')
            cell_text(cells[i], v[1:] if bold else v, bold=bold, size=size)
            if r_i % 2 == 1:
                shade(cells[i], 'F6F4FA')
    for row in t.rows:
        for i, c in enumerate(row.cells):
            c.width = cm_w[i]
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return t


def NOTE(text, fill='FDF8EC', border='E0C98A', label='Lưu ý'):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]
    c.width = Cm(17.0)
    shade(c, fill)
    c.text = ''
    p = c.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(label + ' — ')
    r.bold = True
    r.font.size = Pt(9.8)
    r.font.name = FONT
    for chunk, b in _parse(text):
        r = p.add_run(chunk)
        r.font.size = Pt(9.8)
        r.font.name = FONT
        r.bold = b
    tblBorders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        e = OxmlElement('w:' + edge)
        e.set(qn('w:val'), 'single')
        e.set(qn('w:sz'), '6')
        e.set(qn('w:color'), border)
        tblBorders.append(e)
    t._tbl.tblPr.append(tblBorders)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return t


FIGN = [0]
FIGLIST = []


def FIG(name, caption):
    FIGN[0] += 1
    FIGLIST.append((FIGN[0], caption, name))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(os.path.join(IMG, name + '.png'), width=CONTENT_W)
    cp = doc.add_paragraph()
    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cp.paragraph_format.space_after = Pt(10)
    r = cp.add_run('Hình %d — %s' % (FIGN[0], caption))
    r.font.size = Pt(9)
    r.font.name = FONT
    r.italic = True
    r.font.color.rgb = GREY


def PAGEBREAK():
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def footer_pagenum():
    for s in doc.sections:
        p = s.footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run('Thiên Lương — Đề xuất trang quản trị · Trang ')
        r.font.size = Pt(8.5)
        r.font.name = FONT
        r.font.color.rgb = GREY
        fld = OxmlElement('w:fldSimple')
        fld.set(qn('w:instr'), 'PAGE')
        rr = OxmlElement('w:r')
        rpr = OxmlElement('w:rPr')
        sz = OxmlElement('w:sz')
        sz.set(qn('w:val'), '17')
        rpr.append(sz)
        rr.append(rpr)
        fld.append(rr)
        p._p.append(fld)


# =====================================================================
# TRANG BÌA
# =====================================================================
for _ in range(4):
    doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('ĐỀ XUẤT')
r.font.size = Pt(12)
r.font.name = FONT
r.font.color.rgb = GOLD
r.bold = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
for i, line in enumerate(['TRANG QUẢN TRỊ', 'CHO WEBSITE THIÊN LƯƠNG']):
    if i:
        p.add_run().add_break()
    r = p.add_run(line)
    r.font.size = Pt(25)
    r.font.name = FONT
    r.bold = True
    r.font.color.rgb = DARK
p.paragraph_format.space_after = Pt(8)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('Để thầy tự sửa chữ và ảnh trên website, không cần nhờ kỹ thuật')
r.font.size = Pt(13)
r.font.name = FONT
r.font.color.rgb = PURPLE

doc.add_paragraph()
TABLE(['Nội dung', 'Thông tin'],
      [['§Tài liệu này là gì', 'Đề xuất một trang riêng, có đăng nhập, để thầy tự thêm – sửa – xóa\nnội dung đang hiển thị trên website'],
       ['§Gồm những gì', '10 màn hình, có ảnh thiết kế đầy đủ để Quý khách xem và góp ý'],
       ['§Tình trạng', 'MỚI LÀ ĐỀ XUẤT — chưa làm, chờ Quý khách duyệt'],
       ['§Ngày lập', '19/11/2026'],
       ['§Người nhận', 'Thầy Thiên Lương — chủ website']],
      [25, 75], size=10)

doc.add_paragraph()
NOTE('**Hình 1 và Hình 2** là ảnh chụp website thật đang chạy, có đánh số từng chỗ sẽ sửa được. '
     '**Từ Hình 3 trở đi** là ảnh thiết kế trang quản trị — tên người, ngày giờ và số liệu trong ảnh '
     'chỉ là ví dụ cho dễ hình dung.',
     label='Đọc trước')

PAGEBREAK()

# =====================================================================
# MỤC LỤC
# =====================================================================
H1('Nội dung tài liệu')
for num, name in [
    ('1.', 'Vì sao nên có trang quản trị'),
    ('2.', 'Những chỗ trên website thầy sẽ tự sửa được'),
    ('3.', 'Những phần không sửa qua trang quản trị'),
    ('4.', '10 màn hình trang quản trị (có ảnh)'),
    ('5.', 'Sửa xong thì ra trang thật thế nào'),
    ('6.', 'Thời gian làm và những việc cần Quý khách trả lời'),
]:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(num + '  ')
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = FONT
    r.font.color.rgb = PURPLE
    r = p.add_run(name)
    r.font.size = Pt(11)
    r.font.name = FONT

PAGEBREAK()

# =====================================================================
# 1
# =====================================================================
H1('1. Vì sao nên có trang quản trị')

H2('Hiện nay')
P('Website Thiên Lương chạy rất nhanh và lá số an rất chuẩn, nhưng **toàn bộ chữ trên web đang nằm trong file của website**. '
  'Muốn đổi một dòng tiêu đề, thêm số Zalo hay thay cái logo, thầy đều phải nhắn cho bên kỹ thuật, chờ người ta sửa rồi '
  'đưa bản mới lên — mỗi việc nhỏ cũng mất vài giờ đến vài ngày.')

H2('Nếu có trang quản trị')
BUL('Thầy đăng nhập bằng email và mật khẩu riêng, giống như vào Zalo hay Gmail.')
BUL('Sửa chữ bằng **ô nhập sẵn**, gõ như gõ Word. Bên cạnh có khung **xem trước** để thấy ngay khách sẽ nhìn thấy thế nào.')
BUL('Bấm **Phát hành** là nội dung mới ra trang thật, không cần gọi ai.')
BUL('Sửa nhầm thì bấm **Khôi phục** để quay lại bản cũ. Xóa nhầm thì lấy lại trong **thùng rác**.')
BUL('Phần tính toán lá số **không đụng tới** — vẫn chạy y như hiện nay.')

NOTE('Việc cần làm sớm nhất là **điền link Zalo hoặc Messenger của thầy**. Hiện ô này đang để trống, '
     'nên dải "Nhờ thầy luận giải" ở cuối trang lá số **đang bị ẩn** — khách xem xong lá số không có chỗ nào để liên hệ.',
     label='Quan trọng')

H2('Những việc để làm sau, chưa đưa vào lần này')
P('Website hiện chỉ có 2 trang nên tài liệu này cũng chỉ làm đúng phần đang có. '
  'Mấy thứ sau **chưa có trên web** nên để lại, khi nào thầy cần thì bổ sung, không phải làm lại từ đầu:')
BUL('Viết bài / kiến thức Tử Vi để kéo khách từ Google.')
BUL('Bảng giá các gói luận giải.')
BUL('Nhận đơn luận giải ngay trên web (hiện khách liên hệ qua Zalo).')

PAGEBREAK()

# =====================================================================
# 2
# =====================================================================
H1('2. Những chỗ trên website thầy sẽ tự sửa được')
P('Hai ảnh dưới đây chụp **website thật đang chạy**. Mỗi chỗ thầy sẽ sửa được đều được khoanh khung vàng và đánh số. '
  'Số trong ảnh trùng với số ở bảng ngay bên dưới, nên Quý khách nhìn là biết chỗ nào sửa ở màn hình nào.')

H2('2.1. Trang chủ')
FIG('A-trang-chu', 'Trang chủ — 14 chỗ sửa được (số 1–14)')

PAGEBREAK()

TABLE(['Số', 'Chỗ đó là gì', 'Đang hiển thị', 'Sửa ở'],
      [['§1', 'Logo, tên và câu định vị trên thanh đầu trang', 'THIÊN LƯƠNG · Sáng rõ trước mỗi quyết định', 'Màn 7'],
       ['§2', 'Liên kết trên thanh đầu trang', 'Lập lá số', 'Màn 7'],
       ['§3', 'Khối thương hiệu lớn giữa trang chủ', 'Logo lớn, CÂU CHUYỆN THƯƠNG HIỆU, câu định vị', 'Màn 3'],
       ['§4', 'Chữ trong khối lịch bên trái', 'Hôm nay, Âm lịch, Tiết khí, Giờ hoàng đạo', 'Màn 4'],
       ['§5', 'Dòng chữ nhỏ phía trên tiêu đề', 'Tử Vi Đẩu Số · Trường phái Việt Nam', 'Màn 3'],
       ['§6', 'Tiêu đề lớn của trang chủ', 'Lập lá số Tử Vi chuẩn xác, luận giải bởi thầy Thiên Lương', 'Màn 3'],
       ['§7', 'Đoạn giới thiệu bên dưới tiêu đề', 'An đủ hơn 110 sao, đại vận, tiểu hạn…', 'Màn 3'],
       ['§8', 'Ba ô số liệu nổi bật', '110+ sao an đủ · GMT+7 lịch âm Việt · 1 chạm', 'Màn 3'],
       ['§9', 'Tiêu đề của khung nhập ngày sinh', 'Lập lá số Tử Vi', 'Màn 4'],
       ['§10', 'Chữ trong từng ô nhập', 'Họ và tên · Ngày · Tháng · Năm sinh · Giờ sinh…', 'Màn 4'],
       ['§11', 'Mục tùy chọn nâng cao và 6 tùy chọn bên trong', 'Tùy chọn an sao nâng cao', 'Màn 4, 8'],
       ['§12', 'Chữ trên nút, câu báo lỗi, câu nhắc giờ sinh', 'Lập lá số · Nhập năm sinh từ 1900 đến 2100.', 'Màn 4'],
       ['§13', 'Khối "Lá số gần đây"', 'Tiêu đề khối (danh sách nằm trên máy của khách)', 'Màn 4'],
       ['§14', 'Hai dòng cuối trang', 'Lá số mang tính tham khảo…', 'Màn 3']],
      [6, 32, 46, 16], size=8.8)

PAGEBREAK()

H2('2.2. Trang lá số')
FIG('B-trang-la-so', 'Trang lá số — 8 chỗ sửa được (số 15–22)')

PAGEBREAK()

TABLE(['Số', 'Chỗ đó là gì', 'Đang hiển thị', 'Sửa ở'],
      [['§15', 'Liên kết trên thanh đầu trang lá số', 'Lập lá số mới', 'Màn 7'],
       ['§16', 'Phần đầu trang: tên khách và 8 ô thông tin', 'Trang chủ / Lá số Tử Vi · Mệnh tại · Thân cư…', 'Màn 5'],
       ['§17', 'Thanh công cụ của khách', 'Năm xem · Hiện sao đại vận · Sửa · Sao chép link · In · Tải ảnh', 'Màn 5'],
       ['§18', 'Dòng nhắc phía trên lá số', 'Rê chuột hoặc chạm vào một cung để xem tam phương tứ chính', 'Màn 5'],
       ['§19', 'Khối chữ ở giữa lá số (in luôn lên ảnh khách tải về)', 'TUVITHIENLUONG · Lá Số Tử Vi · dấu triện THIÊN LƯƠNG', 'Màn 5'],
       ['§20', 'Phần chú giải dưới lá số', 'Kim · Mộc · Thủy · Hỏa · Thổ · (M) Miếu · (V) Vượng…', 'Màn 5, 8'],
       ['§21', 'Dải "Nhờ thầy luận giải" và nút liên hệ', '**Đang bị ẩn** vì chưa điền link liên hệ', 'Màn 6'],
       ['§22', 'Hai dòng cuối trang', 'Giống cuối trang chủ', 'Màn 3']],
      [6, 32, 46, 16], size=8.8)

H2('2.3. Ba thứ không nhìn thấy trên trang nhưng vẫn nên sửa được')
TABLE(['Số', 'Là gì', 'Nhìn thấy ở đâu', 'Sửa ở'],
      [['§23', 'Tiêu đề và mô tả hiện ra khi tìm trên Google', 'Kết quả tìm kiếm Google', 'Màn 7'],
       ['§24', 'Ảnh và chữ hiện ra khi dán link lên Facebook / Zalo', 'Bài đăng, tin nhắn có dán link website', 'Màn 7'],
       ['§25', 'Biểu tượng nhỏ trên tab trình duyệt', 'Tab trình duyệt của khách', 'Màn 7']],
      [6, 36, 42, 16], size=9)
P('**Tổng cộng 25 chỗ** — 22 chỗ khách nhìn thấy và 3 thứ nằm phía sau. Tất cả đều có trong 10 màn hình ở mục 4.', size=10)

PAGEBREAK()

# =====================================================================
# 3
# =====================================================================
H1('3. Những phần không sửa qua trang quản trị')
P('Phần tính toán lá số **giữ nguyên trong hệ thống, không cho sửa bằng tay**. Đây là điều nên làm: '
  'bộ an sao đã được đối chiếu kỹ với các nguồn Tử Vi Việt Nam, chỉ cần gõ nhầm một chỗ là sai toàn bộ lá số của mọi khách.')
TABLE(['Phần', 'Vì sao giữ nguyên'],
      [['§Cách đổi lịch âm – dương', 'Đang tính theo lịch Việt Nam (khác lịch Trung Quốc). Sai một ngày là sai cả lá số.'],
       ['§Cách an hơn 110 sao', 'Đã đối chiếu kỹ với các nguồn Tử Vi Việt Nam.'],
       ['§Miếu – vượng – đắc – bình – hãm', 'Dựng từ 20 lá số đối chiếu, có bộ kiểm tra tự động canh giữ.'],
       ['§Đại vận, tiểu hạn, lưu niên', 'Thuộc về cách tính của trường phái, không phải chữ hiển thị.'],
       ['§Cách vẽ lá số 12 cung', 'Đụng vào dễ vỡ bố cục khi in giấy và khi tải ảnh.']],
      [30, 70], size=9.4)
NOTE('Riêng **6 tùy chọn trường phái** (Tứ Hóa năm Canh, năm Nhâm, Khôi – Việt, Thiên Giải, giờ Tý muộn, tháng nhuận) '
     '**vẫn đưa lên trang quản trị** ở Màn 8, vì khách đã tự chọn được trên trang chủ rồi. '
     'Nhưng đặt riêng một màn, chỉ thầy sửa được, và có nút lập thử một lá số để xem đổi rồi thì khác chỗ nào.',
     label='Ngoại lệ')

H2('Tên 12 cung và các ký hiệu trên lá số')
P('Những chữ như **Tử Tức**, **Phu Thê**, ký hiệu **(M) (V) (Đ) (B) (H)**, nhãn **L. / ĐV. / Th.** thì thầy **đổi được chữ hiển thị** '
  'ở Màn 8 — nhưng chỉ đổi cách viết ra màn hình, không đổi cách tính.', size=10)

PAGEBREAK()

# =====================================================================
# 4 — MÀN HÌNH
# =====================================================================
H1('4. 10 màn hình trang quản trị')
P('Mỗi màn hình dưới đây gồm: **ảnh thiết kế**, màn đó để làm gì, và liệt kê rõ **thêm được gì — sửa được gì — xóa được gì**. '
  'Màu sắc, chữ trên nút và cách sắp xếp đều điều chỉnh được theo ý Quý khách.')

SCREENS = [
    ('01-dang-nhap', 'Màn 1 — Đăng nhập',
     'Cửa vào trang quản trị. Chỉ người được thầy cấp tài khoản mới vào được; khách vào web bình thường không nhìn thấy trang này.',
     [('Thêm', 'Không — tài khoản do thầy tạo ở Màn 10.'),
      ('Sửa', 'Đổi mật khẩu của mình.'),
      ('Xóa', 'Không có.')],
     'Quên đăng xuất cũng không sao: để yên 60 phút là hệ thống tự thoát. Nhập sai mật khẩu nhiều lần thì khóa tạm cho an toàn.'),

    ('02-noi-dung-website', 'Màn 2 — Màn hình đầu tiên sau khi đăng nhập',
     'Liệt kê **tất cả khu vực nội dung sửa được** của cả 2 trang, mỗi dòng ghi rõ đang hiển thị chữ gì và sửa lần cuối lúc nào. '
     'Từ đây bấm Sửa là vào thẳng chỗ cần sửa, không phải đi tìm.',
     [('Thêm', 'Không thêm ở đây — danh sách bám đúng những gì website đang có.'),
      ('Sửa', 'Bấm nút Sửa ở từng dòng.'),
      ('Xóa', 'Không xóa ở đây, tránh bấm nhầm.')],
     'Ô màu đỏ ở trên cùng cho biết nút "Liên hệ thầy" **đang ẩn** vì chưa có link — nhìn vào là biết việc cần làm ngay. '
     'Nút **Phát hành** đếm sẵn số thay đổi đang chờ đưa ra trang thật.'),

    ('03-trang-chu-khoi-gioi-thieu', 'Màn 3 — Trang chủ: phần giới thiệu và cuối trang',
     'Sửa phần chữ lớn của trang chủ — các số **3, 5, 6, 7, 8, 14** trong Hình 1. '
     'Bên trái là ô nhập, bên phải hiện **xem trước ngay** đúng như khách sẽ thấy, có nút chuyển qua lại giữa máy tính và điện thoại.',
     [('Thêm', 'Thêm ô số liệu nổi bật (hiện có 3 ô: 110+, GMT+7, 1 chạm).'),
      ('Sửa', 'Dòng chữ nhỏ phía trên, tiêu đề lớn, phần chữ tô vàng kim, đoạn giới thiệu, nội dung từng ô số liệu, '
              'tên và câu định vị ở khối thương hiệu, hai dòng cuối trang.'),
      ('Xóa', 'Xóa ô số liệu không dùng — hoặc chỉ gạt công tắc "Hiện" để cất đi, lúc nào cần thì bật lại.')],
     'Có đếm số chữ để tiêu đề không bị tràn khi khách xem bằng điện thoại, và có lịch sử để quay lại bản cũ bằng một nút.'),

    ('04-trang-chu-bieu-mau', 'Màn 4 — Trang chủ: khung nhập ngày sinh và hai khối hai bên',
     'Sửa chữ trong khung nhập ngày giờ sinh và nhãn hai khối hai bên — các số **4, 9, 10, 11, 12, 13** trong Hình 1.',
     [('Thêm', 'Không thêm ô nhập mới — phần an sao cần đúng các ô ngày, giờ, giới tính hiện có.'),
      ('Sửa', 'Tiêu đề khung nhập, chữ trong từng ô, chữ trên nút, câu báo lỗi, câu nhắc giờ sinh; '
              'nhãn Hôm nay / Âm lịch / Tiết khí / Giờ hoàng đạo; tiêu đề khối "Lá số gần đây".'),
      ('Xóa', 'Không xóa — chỉ bật/tắt khối lịch và khối "Lá số gần đây".')],
     'Ngày âm – dương, can chi, tiết khí, giờ hoàng đạo **do máy tự tính**, thầy chỉ đổi phần chữ. '
     'Danh sách "Lá số gần đây" nằm trên máy của từng khách — trang quản trị không xem được, đúng như cam kết giữ kín thông tin khách.'),

    ('05-trang-la-so', 'Màn 5 — Trang lá số',
     'Sửa phần chữ bao quanh lá số và bật/tắt các nút dành cho khách — các số **16, 17, 18, 19, 20** trong Hình 2.',
     [('Thêm', 'Không thêm khối mới, để lá số in giấy và tải ảnh vẫn đúng bố cục.'),
      ('Sửa', 'Dòng nhắc phía trên lá số, phần chú giải, câu hiện ra khi khách vào mà thiếu thông tin; '
              'tên thương hiệu, tiêu đề và dấu triện ở **khối giữa lá số**.'),
      ('Xóa', 'Không xóa — chỉ tắt từng nút.')],
     'Bật/tắt được từng nút: Sửa, Sao chép link, In, Tải ảnh, chọn năm xem, hiện sao đại vận. '
     'Khối giữa lá số được in luôn lên ảnh khách tải về, nên sửa ở đây là đổi cả ảnh khách đem đi khoe.'),

    ('06-lien-he-cta', 'Màn 6 — Liên hệ và nút kêu gọi',
     'Màn quan trọng nhất về khách hàng: quyết định xem xong lá số thì khách liên hệ thầy bằng cách nào — số **21** trong Hình 2. '
     'Đây cũng là việc nên làm đầu tiên vì hiện cả dải này đang bị ẩn.',
     [('Thêm', 'Thêm kênh liên hệ: Zalo, Messenger, điện thoại, Fanpage…'),
      ('Sửa', 'Tiêu đề và lời mời của dải "Nhờ thầy luận giải", chữ trên nút, chọn kênh nào gắn vào nút, đổi link từng kênh, đổi thứ tự.'),
      ('Xóa', 'Xóa kênh không dùng nữa.')],
     'Chỉ cần dán link Zalo vào rồi bấm Phát hành là dải "Nhờ thầy luận giải" hiện ra trên trang lá số.'),

    ('07-seo-logo-chia-se', 'Màn 7 — Logo, chữ trên Google và ảnh chia sẻ',
     'Gộp mấy việc ít đụng tới: logo và tên thương hiệu, chữ hiện ra khi tìm trên Google, ảnh hiện ra khi dán link lên Facebook/Zalo, '
     'liên kết trên thanh đầu trang — các số **1, 2, 15** trong Hình 1–2 và ba thứ **23, 24, 25** ở mục 2.3.',
     [('Thêm', 'Thêm liên kết trên thanh đầu trang; tải lên logo, biểu tượng tab, ảnh chia sẻ.'),
      ('Sửa', 'Tên thương hiệu, câu định vị, tiêu đề và mô tả trên Google của từng trang, tiêu đề và mô tả khi chia sẻ.'),
      ('Xóa', 'Xóa liên kết không dùng; bỏ logo để quay về mặc định.')],
     'Có đếm số chữ và khung xem trước đúng như Google và Facebook hiển thị, nên gõ xong là biết ngoài kia trông thế nào.'),

    ('08-tuy-chon-an-sao', 'Màn 8 — Tùy chọn an sao (chỉ thầy)',
     'Đặt mặc định cho đúng **6 tùy chọn** đang có trong mục "Tùy chọn an sao nâng cao" trên trang chủ (số **11** trong Hình 1), '
     'và quyết định có cho khách tự đổi hay không.',
     [('Thêm', 'Không — danh sách tùy chọn cố định theo cách an sao.'),
      ('Sửa', 'Chọn cách an mặc định cho từng tùy chọn; đổi chữ hiển thị như tên 12 cung, ký hiệu đắc tính, nhãn L. / ĐV. / Th.'),
      ('Xóa', 'Không có.')],
     'Trước khi lưu có nút **lập thử một lá số** rồi so với cách đang chạy, chỉ rõ cung nào khác đi. '
     'Mọi thay đổi ở màn này đều ghi lại ai đổi và đổi lúc nào.'),

    ('09-xac-nhan-xoa', 'Màn 9 — Hỏi lại trước khi xóa',
     'Mẫu hộp thoại dùng chung cho mọi thao tác xóa trong trang quản trị (ô số liệu, kênh liên hệ, liên kết trên thanh đầu trang).',
     [('Thêm', 'Không có.'),
      ('Sửa', 'Chọn giữ trong thùng rác hay xóa hẳn.'),
      ('Xóa', 'Xác nhận xóa — nút đỏ luôn nằm bên phải và không bao giờ là nút bấm sẵn.')],
     'Hộp thoại **nói rõ xóa xong thì mất gì** và gợi ý cách nhẹ hơn: chỉ muốn ẩn tạm thì gạt công tắc "Hiện" thay vì xóa.'),

    ('10-tai-khoan-nhat-ky', 'Màn 10 — Người dùng và nhật ký',
     'Quản lý ai được vào trang quản trị, xem lại ai đã sửa gì, và lấy lại những thứ lỡ xóa.',
     [('Thêm', 'Thêm người bằng cách gửi lời mời qua email, chọn sẵn quyền.'),
      ('Sửa', 'Đổi tên hiển thị, đổi quyền, tạm khóa một người mà không xóa hẳn.'),
      ('Xóa', 'Xóa người không còn phụ giúp; xóa hẳn thứ trong thùng rác; hoặc bấm **Phục hồi** để lấy lại.')],
     'Thùng rác giữ **30 ngày** rồi mới xóa hẳn, nên lỡ tay vẫn lấy lại được. '
     'Nhật ký ghi rõ lúc nào, ai sửa, làm gì — thêm, sửa, xóa hay phát hành.'),
]

for key, title, purpose, ops, note in SCREENS:
    H2(title)
    FIG(key, title.split('—', 1)[1].strip())
    P(purpose)
    TABLE(['Thao tác', 'Chi tiết'], [['§' + a, b] for a, b in ops], [14, 86], size=9.4)
    NOTE(note)
    PAGEBREAK()

# =====================================================================
# 5
# =====================================================================
H1('5. Sửa xong thì ra trang thật thế nào')
TABLE(['Bước', 'Thầy làm gì', 'Khách đã thấy chưa?'],
      [['§1. Sửa', 'Gõ chữ mới vào ô, bấm Lưu nháp', 'Chưa'],
       ['§2. Xem trước', 'Bấm Xem trước để nhìn đúng như khách sẽ thấy, cả máy tính và điện thoại', 'Chưa'],
       ['§3. Phát hành', 'Bấm Phát hành — chờ khoảng 1–2 phút là nội dung mới lên trang thật', 'Rồi'],
       ['§Nếu đổi ý', 'Bấm Khôi phục để quay lại bản trước, không cần gọi kỹ thuật', 'Rồi']],
      [20, 58, 22], size=9.6)
P('Nói gọn: **gõ xong vẫn chưa ai thấy**, chỉ khi thầy bấm Phát hành thì khách mới thấy. '
  'Nhờ vậy thầy cứ sửa thoải mái, xem đi xem lại rồi mới cho ra.', size=10)

H2('Ai được vào sửa')
TABLE(['Vai trò', 'Là ai', 'Làm được gì'],
      [['§Chủ website', 'Thầy Thiên Lương', 'Toàn quyền, kể cả tùy chọn an sao và cấp tài khoản'],
       ['§Người phụ giúp', 'Trợ lý hoặc bên làm web', 'Sửa chữ, ảnh, kênh liên hệ. **Không** đụng được phần an sao']],
      [20, 25, 55], size=9.6)

H2('Giữ an toàn')
BUL('Trang quản trị nằm ở một đường dẫn riêng, bắt buộc đăng nhập mới vào được.')
BUL('Để yên 60 phút là tự thoát; nhập sai mật khẩu nhiều lần thì khóa tạm.')
BUL('Mỗi người một tài khoản riêng, không dùng chung — để biết ai đã sửa gì.')
BUL('Nội dung cũ được giữ lại nhiều bản, xóa nhầm vẫn lấy lại được trong 30 ngày.')
NOTE('Lá số của khách **vẫn tính ngay trên máy của khách như hiện nay**. Ngày giờ sinh và họ tên khách '
     'không được gửi về đâu cả, trang quản trị cũng không xem được. Thêm trang quản trị không làm thay đổi điều này.',
     label='Riêng tư của khách')

PAGEBREAK()

# =====================================================================
# 6
# =====================================================================
H1('6. Thời gian làm và những việc cần Quý khách trả lời')
TABLE(['Đợt', 'Làm những gì', 'Màn hình', 'Thời gian'],
      [['§Đợt 1\n(cần trước)', 'Phần nền và đăng nhập · màn hình đầu · trang chủ · trang lá số · liên hệ và nút kêu gọi · hỏi lại trước khi xóa · quy trình phát hành và khôi phục',
        '1, 2, 3, 4, 5, 6, 9', 'khoảng 2 – 3 tuần'],
       ['§Đợt 2', 'Logo và chữ trên Google · tùy chọn an sao · người dùng và nhật ký', '7, 8, 10', 'khoảng 1 tuần']],
      [14, 52, 14, 20], size=9.4)
NOTE('Thời gian trên là **ước lượng sơ bộ phần làm web**, chưa tính thời gian thầy soạn nội dung và duyệt. '
     'Con số chính thức sẽ chốt cùng báo giá, sau khi Quý khách trả lời mấy câu dưới đây.', label='Ghi chú')

H2('Mong Quý khách cho ý kiến')
for q in [
    '10 màn hình như trên đã đúng ý chưa? Có màn nào thừa hoặc còn thiếu không?',
    '**Link Zalo / Messenger / số điện thoại** của thầy để gắn vào nút liên hệ là gì?',
    'Ngoài thầy, còn ai được cấp tài khoản vào sửa nội dung?',
    'Tên miền chính thức của website là gì, hiện ai đang giữ?',
    'Mấy phần đang để lại (bài viết, bảng giá, nhận đơn luận giải) — Quý khách có muốn làm luôn đợt này không?',
]:
    NUM(q)
P('')
P('**Sau khi Quý khách trả lời:** chốt phạm vi → gửi báo giá và lịch làm → dựng một bản chạy thử để Quý khách '
  'bấm thử trước, ưng rồi mới làm hoàn chỉnh.')

footer_pagenum()
doc.save(OUT)
print('Đã tạo:', OUT)
print('Số đoạn:', len(doc.paragraphs), '| Số bảng:', len(doc.tables), '| Số ảnh:', FIGN[0])
