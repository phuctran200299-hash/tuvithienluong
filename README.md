# Tử Vi Thiên Lương — Lập lá số Tử Vi

Web app tĩnh (HTML/CSS/JS thuần, không cần server) chỉ làm một việc: **lập lá số Tử Vi theo trường phái Việt Nam**.

## Chạy thử
- Mở trực tiếp `index.html`, hoặc chạy server tĩnh để dùng đủ tính năng (sao chép link, tải PNG):
  ```
  npx serve .        # hoặc: python -m http.server 8080
  ```
- Kiểm thử engine: `node tests/engine.test.js`
- Kiểm thử giao diện: `node tests/ui.test.js` (chốt lại 11 lỗi khách báo, mã TL-01…TL-11)

## Triển khai
> **Đừng copy cả thư mục lên hosting.** Hosting tĩnh publish mọi file nó thấy, nên làm vậy sẽ
> công khai luôn hai file PDF nội bộ, ba bản demo giao diện chưa chốt, `CLAUDE.md` và `README.md`.

```
SITE_URL=https://tenmien.com node tools/build.js   # dựng thư mục dist/
```
`dist/` chỉ chứa `index.html`, `la-so.html`, `assets/` cần thiết, cộng `robots.txt`, `sitemap.xml`
và `_headers`. Script tự chèn thẻ `og:` / `canonical` theo `SITE_URL`, và **dừng build nếu có file
`assets/...` nào được mã trỏ tới mà không được đóng gói kèm** (kể cả khi đường dẫn nằm trong JS).

**Web thật: https://tuvithienluong.vn** — Cloudflare Pages, project `tuvithienluong`
(tên miền mua ở Mắt Bão, nameserver đã chuyển sang Cloudflare).

**Deploy tự động:** push lên nhánh `main` → `.github/workflows/deploy.yml` chạy hai bộ test,
dựng `dist/` với `SITE_URL=https://tuvithienluong.vn` rồi đưa lên Cloudflare (~1 phút). Test hoặc
build lỗi thì dừng, bản đang chạy giữ nguyên; xem kết quả ở tab **Actions** trên GitHub. Workflow cần
hai secret của repo: `CLOUDFLARE_API_TOKEN` (quyền *Account · Cloudflare Pages · Edit*) và
`CLOUDFLARE_ACCOUNT_ID`. Làm thử ở nhánh khác thì không lên web thật.

Deploy tay (khi cần):
```
SITE_URL=https://tuvithienluong.vn node tools/build.js
npx wrangler pages deploy dist --project-name tuvithienluong --branch main
```
Project được tạo theo kiểu *Direct Upload*, nên **không** nối Git trong giao diện Cloudflare được —
đó là lý do dùng GitHub Actions. `dist/` nằm trong `.gitignore` vì nó được dựng lại mỗi lần build.

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Trang chủ: tranh nền, thẻ "Hôm nay" (âm lịch, tiết khí, giờ hoàng đạo), form lập lá số — **giữ thiết kế cũ** (xem mục Năm màn hình) |
| `la-so.html` | Trang lá số: tóm tắt, đổi năm/tháng xem, lá số 12 cung, in / tải ảnh / chia sẻ |
| `chuyen-gia.html` | Hồ sơ Thầy Thiên Lương: lĩnh vực, triết lý, quy trình 4 bước |
| `bang-gia.html` | Bảng phí dịch vụ tư vấn: 12 mã TV-01…TV-12 + 4 gói trọn, cách thu phí (số liệu của khách, áp dụng từ 2026) |
| `quy-trinh.html` | Quy trình nhận đặt lịch hẹn: 6 bước, kèm lưu ý không xem hộ khi người đó chưa đồng ý |
| `bai-viet.html` | Danh sách bài viết + bài chi tiết (`#bai-<slug>`), lọc theo chuyên mục |
| `dat-lich.html` | Biểu mẫu đặt lịch luận giải, tự điền từ lá số vừa lập |
| `assets/js/posts.js` | Toàn bộ nội dung bài viết + hàm dựng thẻ/bài; `posts-page.js` điều khiển trang |
| `assets/js/booking.js` | Biểu mẫu đặt lịch: tự điền, kiểm tra, dựng nội dung yêu cầu để gửi Zalo |
| `assets/js/tuvi-core.js` | Lõi: lịch âm (Hồ Ngọc Đức, GMT+7) + an sao, đại vận, tiểu hạn, lưu niên, nguyệt hạn, tiết khí |
| `assets/js/render.js` | Vẽ lá số 12 cung + trung cung, tam phương tứ chính khi rê chuột, Tuần/Triệt |
| `assets/js/common.js` | Dùng chung: link chia sẻ (`?d=..&m=..`), lịch sử, cấu hình (`lienHeThayUrl`) |
| `assets/js/home.js` / `chart-page.js` | Điều khiển trang chủ / trang lá số |
| `assets/css/style.css` | Giao diện tím – vàng đồng, dựng theo bản demo đã chốt (xem mục Bộ nhận diện) |
| `assets/img/logo-tuvithienluong-tim-*.{png,webp}` | Bộ logo tròn chân dung Thầy Thiên Lương, nền tím, nền ngoài trong suốt (sinh bằng `python tools/gen-logo.py`) |
| `assets/img/og-image.png` | Ảnh hiện ra khi dán link lên Zalo/Facebook (sinh bằng `python tools/gen-og.py`) |
| `tools/serve.js` | Máy chủ chạy thử trên máy (`node tools/serve.js`): phục vụ cả `/la-so` lẫn `/la-so.html` giống Cloudflare Pages, nên link lưu từ bản thật mở ở máy vẫn chạy |
| `tools/build.js` | Dựng `dist/` để deploy: lọc file được phép công bố, chèn thẻ `og:`, sinh `robots.txt`/`sitemap.xml`/`_headers` |
| `tests/engine.test.js` | Đối chiếu từng sao với lá số mẫu tuvi.vn (Kỷ Mão 1999) |
| `tests/ui.test.js` | Chốt 11 lỗi khách báo: thứ tự họ tên, lá số vừa khung điện thoại, trung cung, tên thương hiệu, logo, chú giải, menu… |
| `tools/gen-logo.py` | Sinh bộ logo tím từ `tools/logo-src/logo-chan-dung-goc.png` (đổi nền navy → tím, cắt tròn, xuất 128/256/512/1024 + favicon) |
| `tools/xcheck/` | Script đối chiếu engine với tuvi.vn / iztro / lasotuvi (xem `tools/xcheck/README.md`) |
| `design-1/2/3.html` + `assets/css/theme-*.css` | 3 bản demo giao diện để khách chọn (xem mục dưới) |

## Bảy màn hình
Đây là web tĩnh nhiều trang, **không phải SPA**. Bản demo khách duyệt dùng `location.hash` để chuyển
giữa 4 khung xem, nhưng dự án này không làm vậy được: **thông số lá số đã chiếm dấu `#`** (xem mục
"Trang lá số" bên dưới). Nên mỗi màn là một file riêng, chỉ `bai-viet.html` dùng `#bai-<slug>` cho bài
chi tiết — chỗ đó không có lá số nên an toàn.

Header và footer được chép tay vào các file (không có bước build template). `tests/ui.test.js` kiểm
các trang có khớp nhau không.

**Hai thiết kế cùng tồn tại (theo yêu cầu khách):**
- `index.html` **giữ giao diện trước bản demo** (đã có các sửa TL-01…TL-11). Toàn bộ CSS của nó nằm
  trong khối `.page-home` ở `style.css`, có bộ token riêng (chữ Noto Serif, `.wrap` rộng 1200px) nên
  không ảnh hưởng sáu trang kia. Đừng gỡ tiền tố `.page-home`.
- `la-so.html` và năm trang mới dùng giao diện theo bản demo.

**Công tắc năm trang mới — `CONFIG.trangMoi` trong `assets/js/common.js`** (hiện `true`, đang hiện đủ bảy trang):
- `false`: Chuyên gia · Bảng phí · Quy trình · Bài viết · Đặt lịch bị **ẩn** — mọi link tới chúng bị ẩn
  bằng JS, thanh "Nhờ Thầy luận giải" và dải CTA dính đáy ở trang lá số cũng ẩn; `tools/build.js` đọc
  đúng dòng này và **không đóng gói** năm trang + `posts.js`, `posts-page.js`, `booking.js` vào `dist/`.
- `true`: hiện lại đủ menu, `dist/` có đủ bảy trang. Chỉ đổi một chữ này, rồi build lại.

**Bảng phí là số liệu của khách.** `bang-gia.html` (12 mã TV-01…TV-12 + 4 gói trọn), ô chọn gói
`#pkg` trong `dat-lich.html` và bước 3 của `quy-trinh.html` phải khớp nhau; `tests/ui.test.js` chốt
từng con số. Khách gửi bảng phí mới thì sửa cả ba chỗ trong cùng một lần.

## Ba bản demo giao diện cũ (đã thay thế)
> Ba file `design-*.html` dưới đây là bản chọn giao diện **đợt trước**, nay đã bị bản demo mới thay thế.
> Chúng vẫn `<link>` vào `style.css` nên sau đợt dựng lại thì bố cục vỡ. Không được publish, xoá được
> khi khách xác nhận.
Mỗi bản là **một trang chạy thật**: form + lá số 12 cung gộp chung một trang, dùng đúng engine và đúng
`render.js` của trang thật, chỉ khác CSS. Logo: `assets/img/logo-mark.svg` (vẽ lại theo bộ nhận diện Thiên Lương).

| Bản | File | Phong cách |
|---|---|---|
| 1 · Cổ Thư | `design-1.html` + `assets/css/theme-co-thu.css` | Giấy cũ, viền kim nhũ, chữ chân phương (serif) |
| 2 · Thiên Hà | `design-2.html` + `assets/css/theme-thien-ha.css` | Trời đêm, kim nhũ phát sáng, **lá số nền tối** |
| 3 · Thanh Tịnh | `design-3.html` + `assets/css/theme-thanh-tinh.css` | Nền trắng, kẻ mảnh, tối giản hiện đại |

`assets/js/demo.js` và `assets/css/demo.css` chỉ phục vụ 3 trang demo này.
Khi khách chốt một bản, chuyển phần CSS của bản đó vào `assets/css/style.css` rồi xóa các file demo.

## Các nguồn mở đã khảo sát
| Dự án | Đánh giá | Dùng thế nào |
|---|---|---|
| doanguyen/lasotuvi (MIT, Python) | Phái **Việt Nam**, đúng cách an của tuvi.vn | **Lõi an sao** — port sang JS, sửa lỗi |
| SylarLong/iztro (MIT, ~4.4k⭐) | Mạnh nhất nhưng phái **Trung Quốc** (lịch GMT+8, Tứ Hóa & sao khác VN) | Chỉ tham khảo, không dùng lõi |
| Renhuai123/ziwei-doushu, ziweiknows/ziwei-chart | Phái Nghê Hải Hạ / TQ, GPL hoặc khác hệ | Không phù hợp người Việt |
| dangtrandang/tuvidmt, manhtd-ssid/tu-vi-be, tinsdark/tu_vi | Đều fork / port lại lasotuvi (cùng lõi, cùng lỗi) | Không thêm dữ liệu mới |
| drakelam/la-so-tu-vi (PHP/JS), naot7/tu-vi-viet-nam | Ít cập nhật, không có kiểm thử | Tham khảo |

## Sửa / bổ sung so với lasotuvi gốc
- **Sửa**: Phá Toái bị đảo Tỵ ↔ Dậu; Mệnh chủ/Thân chủ tra nhầm theo Can (đúng là theo Chi năm); “Âm dương thuận/nghịch lý” so sai đối tượng;
  **Thiên Khôi/Việt sai ở Can Đinh, Mậu, Nhâm**; **Hỏa/Linh tuổi Tỵ Dậu Sửu đảo điểm khởi**; **Lưu Hà Can Đinh/Canh bị đảo**.
- **Bổ sung**: miếu hãm Thiên Phủ; can 12 cung; lưu niên (ĐV./LN.), nguyệt hạn (Th.1–12), lưu tinh (L.Thái Tuế, L.Lộc Tồn, L.Kình/Đà, L.Mã, L.Xương/Khúc, L.Khôi/Việt, L.Hồng Loan, L.Đào Hoa, L.Kiếp Sát, L.Khốc/Hư, L.Tang/Hổ, L.Long Đức, L.Phúc Đức, L.Thiên Đức, L.Nguyệt Đức, Lưu Tứ Hóa);
  **sao đại vận** (ĐV.Lộc Tồn, ĐV.Kình/Đà, ĐV.Khôi/Việt, ĐV.Xương/Khúc, ĐV.Mã, ĐV.Tứ Hóa — an theo Can/Chi của cung đại vận, bật/tắt được trên trang lá số);
  cân lượng; lai nhân cung; tiểu hạn quanh trung cung; đổi âm lịch có kiểm tra tháng nhuận; giờ Tý muộn.
- **Múi giờ**: form chỉ nhận **giờ Việt Nam (GMT+7)** — đúng với gần như toàn bộ người xem, đỡ một ô dễ chọn nhầm.
  Engine vẫn nhận tham số `tz` và link cũ có `tz=` vẫn mở đúng.

## Kiểm chứng
Bốn lớp đối chiếu độc lập. Script nằm trong `tools/xcheck/` (xem `tools/xcheck/README.md` để chạy lại);
dữ liệu đối chiếu tải về thì bị `.gitignore`, dựng lại được bằng chính các script đó.
Lần chạy lại gần nhất: **16/11/2026**, với iztro 2.6.5 và bản `main` mới nhất của lasotuvi.

1. **`tests/engine.test.js`** — 39 phép kiểm: lá số mẫu tuvi.vn (khớp từng sao), bảng an sao đủ 10 Can / 4 nhóm tam hợp,
   sao đại vận, bộ Đức lưu niên, bảng đắc tính phụ tinh, từ chối dữ liệu sai,
   và một lượt quét **2.000+ lá số (1900–2100, cả 29/2, giờ Tý muộn, tháng nhuận)** kiểm các bất biến:
   đủ 12 cung chủ, 12 sao Tràng Sinh, 12 chi tiểu hạn, 12 tháng nguyệt hạn, đại hạn cách đều 10 tuổi,
   Tuần/Triệt mỗi thứ đúng 2 cung, đúng 1 cung Thân, đúng 14 chính tinh, không có đắc tính lạ.
2. **tuvi.vn (phái VN, trang tham chiếu chính)** — 20 lá số chọn theo từng Can/Chi khó, gửi qua form rồi bóc HTML:
   khớp **216/227 hạng mục**, gồm Can 12 cung (Ngũ Hổ Độn), tên cung, đại hạn, tiểu hạn, Tràng Sinh, nguyệt hạn,
   chính tinh + miếu/vượng/đắc/bình/hãm, ~100 phụ tinh, toàn bộ lưu tinh và sao đại vận.
3. **iztro (TQ, ~4.4k⭐)** — 4.000 lá số ngẫu nhiên: khớp 100% ở chính tinh, Cục, đại hạn, tên cung, cung Thân,
   Tuần, Triệt, vòng Thái Tuế, Bác Sĩ (cả 12 sao), Tràng Sinh, Tứ Hóa và ~60 phụ tinh — **90 hạng mục khớp tuyệt đối**.
   Chỉ còn 7 hạng mục lệch, tất cả đều là khác biệt phái VN ↔ phái TQ (bảng bên dưới).
4. **lasotuvi (Python gốc)** — 2.000 lá số: **khớp 129 hạng mục**; mọi chỗ lệch đều là sửa đổi có chủ ý đã nêu ở trên
   (kể cả **Thai ↔ Dưỡng bị đảo trong lasotuvi** — iztro và thứ tự vòng Tràng Sinh cổ điển xác nhận bản này đúng).

   **Lưu ý về đắc tính của lasotuvi**: `DiaBan.py` chỉ gọi `anDacTinh()` khi ô tương ứng trong `maTranDacTinh`
   có giá trị; gặp ô `None` thì sao — vốn là **biến toàn cục cấp module** — giữ nguyên đắc tính của *lá số trước đó*.
   Vì các bảng này chỉ chứa `Đ` và `None`, rò rỉ chỉ lan được đúng một giá trị nên trông rất "ổn định" và dễ bị bỏ qua.
   `tools/xcheck/dump_py.py` nay reset đắc tính trước mỗi lá số để vô hiệu hóa lỗi này. Sau khi vô hiệu hóa,
   5 hạng mục (đắc tính Đại Hao, Tiểu Hao, Thiên Hình, Thiên Mã, Thiên Riêu) chuyển từ "lệch hàng nghìn ca"
   sang **khớp 100%** — chúng chỉ là nhiễu. Bảy hạng mục đắc tính còn lệch gồm 5 bảng đã cố ý dựng lại (mục dưới)
   và 2 trường hợp (Hỏa Tinh, Linh Tinh) chỉ là hệ quả của lệch vị trí — bảng đắc tính của chúng giống hệt nhau ở hai bên.

### Những chỗ còn khác tuvi.vn (đã truy nguyên, không phải lỗi)
| Điểm | Bản này | tuvi.vn | Căn cứ |
|---|---|---|---|
| Thiên Hỷ khi tuổi Thìn | Tỵ (xung chiếu Hồng Loan) | Tý | lasotuvi + iztro + luật xung chiếu đều cho Tỵ |
| Văn Tinh năm Nhâm | Dần | Dậu | lasotuvi cho Dần |
| L.Long Đức, L.Phúc Đức | Theo vòng Thái Tuế của năm xem | Trùng vị trí sao gốc | tuvi.vn tự mâu thuẫn (L.Thiên Đức/L.Nguyệt Đức của họ vẫn theo năm xem) |
| ĐV. Hóa Khoa khi cung đại vận can Nhâm | Tả Phù | Thiên Phủ | tuvi.vn dùng Tả Phù cho năm sinh Nhâm nhưng Thiên Phủ cho đại vận |
| ĐV. Xương/Khúc một số Can | Theo bảng lưu Xương/Khúc | Thiếu hoặc lệch | cùng bảng đó khớp 100% ở lưu niên |

### Những chỗ khác iztro (phái Trung Quốc — khác hệ, không phải lỗi)
Đo trên 4.000 lá số ngẫu nhiên, 16/11/2026:

| Điểm | Bản này (phái VN) | iztro (phái TQ) | Lệch / 4.000 | Căn cứ |
|---|---|---|---|---|
| Giải Thần | an cùng cung Phượng Các (theo Long Trì) | an theo chi năm | 3.665 | **lasotuvi khớp 100%** với bản này |
| Thiên Quý | cách an phái VN | cách an phái TQ | 3.318 | **lasotuvi khớp 100%** với bản này |
| Hỏa Tinh | khởi theo tam hợp tuổi, bảng VN | bảng TQ | 1.729 | lasotuvi khớp 3/4 nhóm tuổi; riêng Tỵ Dậu Sửu xem mục “Sửa” ở trên |
| Linh Tinh | như trên | như trên | 1.599 | như trên |
| Thiên Trù | năm Quý → **Tuất** | năm Quý → Hợi | 395 | khớp tuvi.vn |
| Thiên Khôi / Thiên Việt | năm Canh → Ngọ–Dần | năm Canh → Sửu–Mùi | 388 | tùy chọn `khoiVietCanh`; mặc định khớp tuvi.vn |

Mọi hạng mục khác — gồm **cả 12 sao vòng Bác Sĩ** và tên 12 cung — khớp tuyệt đối.

> **Bẫy khi đọc báo cáo iztro**: iztro (vi-VN) dịch **hai sao khác nhau** thành cùng tên “Phi Liêm” —
> 飞廉 của vòng Bác Sĩ (phái VN có) và 蜚廉 trong `adjectiveStars` (riêng phái TQ). Gộp chung sẽ thấy
> “Phi Liêm lệch 3743/8000” trong khi vòng Bác Sĩ thực tế khớp **0 lỗi / 4.000**. `cmp-iztro.js` đã tách hai sao này.
> Tương tự, iztro gọi cung Tử Tức là “Tử Nữ” — chỉ khác cách gọi, đã map trong script.

### Bảng miếu/vượng/đắc/bình/hãm của phụ tinh (đã bổ sung)
Trước đây 8 phụ tinh chỉ có bảng thưa của lasotuvi. Nay bảng được dựng lại **đầy đủ 12 cung** từ 20 lá số tuvi.vn
(`node tools/xcheck/dac-tinh.js`), phủ kín mọi vị trí mà từng sao có thể tới:
Lộc Tồn, Thiên Mã, Thiên Khốc, Thiên Hư, Thiên Hình, Thiên Riêu, Văn Xương, Văn Khúc.

- **Lỗi tìm ra**: lasotuvi dùng **chung một bảng cho Thiên Khốc và Thiên Hư** (và cho Địa Không – Địa Kiếp).
  tuvi.vn cho hai bảng khác hẳn nhau: Khốc đắc ở Tý Mão Ngọ Mùi Dậu, còn Hư chỉ đắc ở Tỵ Thân Hợi.
  Nhờ vậy giải quyết luôn điểm treo cũ "Khốc/Hư ở Dậu": **Hãm**, không phải Đắc.
- **Sửa thêm**: Văn Xương / Văn Khúc ở Thìn là **Đắc** (trước ghi Hãm).
- **Để trống** (tuvi.vn không ghi, không tự bịa): Xương/Khúc ở Mão và Dậu, Thiên Khốc ở Sửu, Lộc Tồn ở Tỵ và Hợi.
- **Không lấy bảng của phái Trung Quốc**: iztro có bảng 庙旺得利平不陷 đầy đủ nhưng khác hệ
  (Kình Dương ở Sửu: TQ *miếu* / VN *đắc*; Hỏa Tinh ở Dần: TQ *miếu* / VN *đắc*; Văn Khúc ở Hợi: TQ *vượng* / VN *đắc*).
  Lấy sang sẽ làm sai cách đọc của phái Việt Nam.

## Điểm cần thầy xác nhận (đều chỉnh được trong “Tùy chọn an sao nâng cao”)
| Điểm | Mặc định | Tùy chọn khác | Đã đối chiếu |
|---|---|---|---|
| Tứ Hóa năm Canh | Nhật – Vũ – Âm – Đồng | Nhật – Vũ – Đồng – Âm | ✔ khớp tuvi.vn |
| Tứ Hóa năm Nhâm | **Tả Phù hóa Khoa** | Thiên Phủ hóa Khoa | ✔ khớp tuvi.vn + iztro |
| Khôi – Việt năm Canh | Ngọ – Dần | Sửu – Mùi | ✔ khớp tuvi.vn (iztro theo TQ: Sửu – Mùi) |
| Thiên Giải | **Từ Thân đếm liền từng cung** | Đếm nhảy cung (sách cụ Thiên Lương) | ✔ khớp tuvi.vn 16/16 |
| Giờ Tý muộn 23h–24h | Tính sang ngày hôm sau | Tính ngày hiện tại | ✔ khớp tuvi.vn |
| Sinh tháng nhuận | An theo chính tháng đó | Sau ngày 15 tính sang tháng sau | chưa có nguồn đối chiếu |

Chưa có tùy chọn (giữ theo lasotuvi, cần thầy xem): Thiên Trù năm Quý ở **Tuất** (khớp tuvi.vn; TQ: Hợi).
Còn để trống chờ thầy: đắc tính của Văn Xương / Văn Khúc ở **Mão** và **Dậu**, Thiên Khốc ở **Sửu**,
Lộc Tồn ở **Tỵ** và **Hợi** — tuvi.vn không ghi, lasotuvi ghi nhưng không đáng tin.
Nguyệt hạn: tháng Giêng tính từ cung tiểu hạn (đếm lùi tới tháng sinh, rồi tới giờ sinh) — khớp tuvi.vn.
## Bộ nhận diện (chốt 18/11/2026)

- **Tên duy nhất:** `TỬ VI THIÊN LƯƠNG` (chữ in: logo, header) · `Tử Vi Thiên Lương` (văn bản, `<title>`).
  Chuỗi `tuvithienluong` chỉ còn dùng cho **tên miền và tên file**, không bao giờ hiện thành chữ trên trang.
  `tests/ui.test.js` chặn việc nó quay lại.
- **Logo:** ảnh tròn chân dung Thầy Thiên Lương, nền tím `#3b1d5d`, nền ngoài trong suốt, viền vàng 1,5px
  (vẽ bằng CSS `border`, không nung vào ảnh — để viền giữ đúng độ mảnh ở mọi cỡ hiển thị). Ở header,
  vòng chữ trong logo quá nhỏ để đọc nên logo **luôn đi kèm** chữ `TỬ VI THIÊN LƯƠNG` màu vàng đồng
  bên phải. Không kéo dãn, không cắt vuông, không đặt trên nền ảnh.

| File | Cỡ | Dùng ở đâu |
|---|---|---|
| `logo-tuvithienluong-tim-128.png` + `-256.png` | 128 / 256 px | Header (52px desktop, 42px mobile; 256 cho màn Retina qua `srcset`), huy hiệu giữa lá số trên điện thoại |
| `logo-tuvithienluong-tim-512.webp` | 512 px | Banner trang chủ, mục Chuyên gia |
| `logo-tuvithienluong-tim-1024.png` | 1024 px | Bản in; nguồn để `gen-og.py` dán vào ảnh chia sẻ. **Không publish** (nặng 1,4 MB) |
| `logo-tuvithienluong-tim-master.png` | 1084 px | Bản gốc đã cắt tròn, không dùng trực tiếp trên web. **Không publish** |
| `favicon.ico` · `apple-touch-icon.png` | 16–64 / 180 px | Biểu tượng tab và màn hình chính điện thoại |
| `og-image.png` | 1200×630 | Ảnh xem trước khi gửi link qua Zalo/Facebook |

- **Bảng màu** (lấy nguyên văn brief, `tests/ui.test.js` khoá từng giá trị):

  | Token | Mã | Dùng ở đâu |
  |---|---|---|
  | `--tl-purple-950` | `#1c0e30` | nền trang, chân trang |
  | `--tl-purple-900` | `#2a1546` | header, bảng menu xổ |
  | `--tl-purple-800` | `#3b1d5d` | quầng sáng đầu trang, nền logo |
  | `--tl-purple-700` | `#4c286e` | thẻ, bề mặt nổi |
  | `--tl-gold-500` | `#c9a56b` | viền, nét, nút phụ |
  | `--tl-gold-300` | `#e8cf9f` | chữ thương hiệu, tiêu đề |
  | `--tl-ivory` | `#fbf7ef` | nền lá số |

  Tên token cũ (`--tl-paper`, `--tl-lav-*`, `--font-serif`…) vẫn còn trong `:root` dưới dạng bí danh,
  chỉ để phần CSS lá số không phải viết lại — đừng dùng thêm chỗ mới.
- **Chữ:** `Cormorant Garamond` cho tiêu đề, `Be Vietnam Pro` cho nội dung. Cormorant mặc định dùng
  chữ số kiểu cổ (số 1 và 8 thụt khỏi dòng cơ sở) nên mọi chỗ có số đều đặt
  `font-variant-numeric: lining-nums tabular-nums`.
- Sửa logo → chạy lại `python tools/gen-logo.py`, rồi `python tools/gen-og.py` (ảnh chia sẻ dán logo đó vào),
  rồi `node tests/ui.test.js`.
