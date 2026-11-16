# Bộ script đối chiếu độ chính xác

Dùng để kiểm tra engine `assets/js/tuvi-core.js` với các nguồn bên ngoài. Không phải phần của web (đừng đưa thư mục `tools/` lên hosting).

| Script | Nguồn đối chiếu | Cần gì | Chạy |
|---|---|---|---|
| `cmp-tuvivn.js` | **tuvi.vn** (phái VN) — 16 lá số chọn theo từng Can/Chi khó | Mạng | `node tools/xcheck/cmp-tuvivn.js` |
| `cmp-offline.js` | Chính 16 lá số đó, đọc lại HTML đã lưu trong `html/` | — | `node tools/xcheck/cmp-offline.js` |
| `cmp-iztro.js` | **iztro** (phái TQ) — 4.000 lá số ngẫu nhiên | `npm i iztro` trong thư mục này | `node tools/xcheck/cmp-iztro.js` |
| `cmp-lasotuvi.js` | **lasotuvi** (Python gốc) — 2.000 lá số | Python + bản clone lasotuvi | xem bên dưới |
| `dac-tinh.js` | Dựng bảng **miếu/vượng/đắc/bình/hãm** từ HTML tuvi.vn + iztro, so với bảng engine | `html/` (+ iztro nếu muốn cột TQ) | `node tools/xcheck/dac-tinh.js` |
| `gen-cover.js` | Tìm thêm lá số cần tải để **phủ kín 12 cung** cho từng phụ tinh | — | `node tools/xcheck/gen-cover.js` |
| `fetch-extra.js` | Tải các lá số `gen-cover.js` đề xuất (`extra-cases.json`) | Mạng | `node tools/xcheck/fetch-extra.js` |

### Dựng bảng đắc tính
```sh
node tools/xcheck/dac-tinh.js        # bảng 3 dòng: tuvi.vn / iztro / engine
node tools/xcheck/dac-tinh.js all    # kể cả sao chưa có dữ liệu
```
Trong bảng: `·` = chưa gặp lá số nào có sao ở cung đó, `—` = có gặp nhưng **tuvi.vn không ghi** đắc tính.
Nếu còn `·`, chạy `gen-cover.js` rồi `fetch-extra.js` để tải đúng vài lá số còn thiếu (mỗi lần chỉ vài lá).

**Đừng gộp cột iztro vào engine**: bảng đắc tính phụ tinh của phái Trung Quốc khác hẳn phái Việt Nam
(vd. Kình Dương ở Sửu: TQ *miếu*, VN *đắc*; Hỏa Tinh ở Dần: TQ *miếu*, VN *đắc*). Cột iztro chỉ để tham khảo.

## tuvi.vn
`cmp-tuvivn.js` gửi POST tới form công khai của tuvi.vn (chỉ ngày/giờ/giới tính, tên luôn là "A" — **không gửi thông tin cá nhân của ai**),
lưu HTML vào `html/`, rồi đối chiếu. Giữa hai lượt tải có nghỉ 1,5 giây.

Sau khi đã có `html/`, dùng `cmp-offline.js` để thử lại không cần mạng — và để so với tùy chọn khác:

```sh
node tools/xcheck/cmp-offline.js thienGiai=nhayCung tuHoaNham=thienPhu
```

Cách này dùng để chốt mặc định cho `thienGiai` và `tuHoaNham`: chạy cả hai phương án, chọn phương án khớp tuvi.vn.

## lasotuvi (Python)
```sh
git clone https://github.com/doanguyen/lasotuvi .ref/lasotuvi     # từ gốc repo
node tools/xcheck/gen-cases.js 2000                               # sinh cases.json
py -I tools/xcheck/dump_py.py                                     # hoặc: LASOTUVI=<đường dẫn> py -I ...
node tools/xcheck/cmp-lasotuvi.js
```

### Rò rỉ đắc tính của lasotuvi — đã xử lý
lasotuvi giữ mỗi sao trong một **biến toàn cục cấp module**, còn `DiaBan.py` chỉ gọi `anDacTinh()` khi ô tương ứng
trong `maTranDacTinh` có giá trị:

```python
if maTranDacTinh[sao.saoID][viTriDiaBan] in ["M", "V", "Đ", "B", "H"]:
```

Gặp ô `None` thì sao **giữ nguyên đắc tính của lá số trước đó**. Vì các bảng này chỉ chứa `Đ` và `None`,
rò rỉ chỉ lan được đúng một giá trị, nên kết quả trông rất "ổn định" — kiểm tra kiểu "cùng (sao, cung) có luôn ra
cùng một giá trị không" **sẽ không phát hiện được**. Cách bắt: chạy cùng một lá số đơn độc rồi chạy lại sau vài trăm
lá số khác trong cùng tiến trình, đắc tính sẽ khác nhau.

`dump_py.py` nay reset đắc tính trước mỗi lá số nên `py.json` đã sạch. Sau khi reset, 5 hạng mục
(đắc tính Đại Hao, Tiểu Hao, Thiên Hình, Thiên Mã, Thiên Riêu) chuyển từ lệch hàng nghìn ca sang khớp 100%.
Bảy hạng mục đắc tính còn lệch, chia làm hai nhóm, đều **không phải lỗi**:

- **Bảng đã cố ý dựng lại từ tuvi.vn** (xem `README.md` gốc): Thiên Hư (1015/1015 — lasotuvi dùng chung bảng với
  Thiên Khốc), Văn Khúc (527), Văn Xương (449), Thiên Khốc (163 — ô để trống ở Sửu), Hóa Kỵ (73 — ô để trống).
- **Hệ quả của lệch vị trí, không phải lệch bảng**: Hỏa Tinh (445) và Linh Tinh (479). Bảng đắc tính của hai sao này
  **giống hệt nhau ở cả hai bên**; chúng chỉ khác đắc tính vì bị an vào cung khác (nhóm tuổi Tỵ Dậu Sửu).

Nếu chạy lại mà thấy Đại Hao / Tiểu Hao / Thiên Hình / Thiên Mã / Thiên Riêu lệch trở lại, nghĩa là bản reset bị mất.

## Đọc kết quả
Mỗi script in ra các hạng mục lệch (kèm ví dụ) rồi tổng số hạng mục khớp. Danh sách các chỗ lệch **đã truy nguyên và cố ý giữ**
nằm ở `README.md` gốc, mục “Kiểm chứng”. Khi sửa engine, chạy lại cả 3 script và cập nhật bảng đó.
