# Tuvithienluong — Lập lá số Tử Vi

Web app tĩnh (HTML/CSS/JS thuần, không cần server) chỉ làm một việc: **lập lá số Tử Vi theo trường phái Việt Nam**.

## Chạy thử
- Mở trực tiếp `index.html`, hoặc chạy server tĩnh để dùng đủ tính năng (sao chép link, tải PNG):
  ```
  npx serve .        # hoặc: python -m http.server 8080
  ```
- Kiểm thử engine: `node tests/engine.test.js`
- Triển khai: copy cả thư mục lên bất kỳ hosting tĩnh nào (Netlify, Vercel, GitHub Pages, cPanel...).

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Trang chủ: tranh nền, thẻ "Hôm nay" (âm lịch, tiết khí, giờ hoàng đạo), form lập lá số |
| `la-so.html` | Trang lá số: tóm tắt, đổi năm/tháng xem, lá số 12 cung, in / tải ảnh / chia sẻ |
| `assets/js/tuvi-core.js` | Lõi: lịch âm (Hồ Ngọc Đức, GMT+7) + an sao, đại vận, tiểu hạn, lưu niên, nguyệt hạn, tiết khí |
| `assets/js/render.js` | Vẽ lá số 12 cung + trung cung, tam phương tứ chính khi rê chuột, Tuần/Triệt |
| `assets/js/common.js` | Dùng chung: link chia sẻ (`?d=..&m=..`), lịch sử, cấu hình (`lienHeThayUrl`) |
| `assets/js/home.js` / `chart-page.js` | Điều khiển trang chủ / trang lá số |
| `assets/css/style.css` | Giao diện tím – vàng kim (màu lấy từ PDF nhận diện) |
| `assets/img/bg-scene.svg` | Tranh nền (sinh bằng `node tools/gen-scene.js`) |
| `tests/engine.test.js` | Đối chiếu từng sao với lá số mẫu tuvi.vn (Kỷ Mão 1999) |
| `tools/xcheck/` | Script đối chiếu engine với tuvi.vn / iztro / lasotuvi (xem `tools/xcheck/README.md`) |
| `design-1/2/3.html` + `assets/css/theme-*.css` | 3 bản demo giao diện để khách chọn (xem mục dưới) |

## Ba bản demo giao diện (để khách chọn)
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
Ba lớp đối chiếu độc lập (script trong thư mục tạm của phiên làm việc, không nằm trong repo):

1. **`tests/engine.test.js`** — 39 phép kiểm: lá số mẫu tuvi.vn (khớp từng sao), bảng an sao đủ 10 Can / 4 nhóm tam hợp,
   sao đại vận, bộ Đức lưu niên, bảng đắc tính phụ tinh, từ chối dữ liệu sai,
   và một lượt quét **2.000+ lá số (1900–2100, cả 29/2, giờ Tý muộn, tháng nhuận)** kiểm các bất biến:
   đủ 12 cung chủ, 12 sao Tràng Sinh, 12 chi tiểu hạn, 12 tháng nguyệt hạn, đại hạn cách đều 10 tuổi,
   Tuần/Triệt mỗi thứ đúng 2 cung, đúng 1 cung Thân, đúng 14 chính tinh, không có đắc tính lạ.
2. **tuvi.vn (phái VN, trang tham chiếu chính)** — 20 lá số chọn theo từng Can/Chi khó, gửi qua form rồi bóc HTML:
   khớp **216/227 hạng mục**, gồm Can 12 cung (Ngũ Hổ Độn), tên cung, đại hạn, tiểu hạn, Tràng Sinh, nguyệt hạn,
   chính tinh + miếu/vượng/đắc/bình/hãm, ~100 phụ tinh, toàn bộ lưu tinh và sao đại vận.
3. **iztro (TQ, ~4.4k⭐)** — 4.000 lá số ngẫu nhiên: khớp 100% ở chính tinh, Cục, đại hạn, cung Thân, Tuần, Triệt,
   vòng Thái Tuế, Bác Sĩ, Tràng Sinh, Tứ Hóa và ~60 phụ tinh.
4. **lasotuvi (Python gốc)** — 2.000 lá số: khớp 126 hạng mục; mọi chỗ lệch là lỗi đã sửa ở mục trên
   (kể cả **Thai ↔ Dưỡng bị đảo trong lasotuvi** — iztro và thứ tự vòng Tràng Sinh cổ điển xác nhận bản này đúng)
   và bảng miếu hãm bị rò trạng thái giữa các lá số do dùng biến toàn cục (lỗi của lasotuvi).

### Những chỗ còn khác tuvi.vn (đã truy nguyên, không phải lỗi)
| Điểm | Bản này | tuvi.vn | Căn cứ |
|---|---|---|---|
| Thiên Hỷ khi tuổi Thìn | Tỵ (xung chiếu Hồng Loan) | Tý | lasotuvi + iztro + luật xung chiếu đều cho Tỵ |
| Văn Tinh năm Nhâm | Dần | Dậu | lasotuvi cho Dần |
| L.Long Đức, L.Phúc Đức | Theo vòng Thái Tuế của năm xem | Trùng vị trí sao gốc | tuvi.vn tự mâu thuẫn (L.Thiên Đức/L.Nguyệt Đức của họ vẫn theo năm xem) |
| ĐV. Hóa Khoa khi cung đại vận can Nhâm | Tả Phù | Thiên Phủ | tuvi.vn dùng Tả Phù cho năm sinh Nhâm nhưng Thiên Phủ cho đại vận |
| ĐV. Xương/Khúc một số Can | Theo bảng lưu Xương/Khúc | Thiếu hoặc lệch | cùng bảng đó khớp 100% ở lưu niên |

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
