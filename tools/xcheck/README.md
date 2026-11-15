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

Lưu ý: lasotuvi dùng biến toàn cục cho mỗi sao nên **miếu/vượng/đắc/hãm bị rò từ lá số trước sang lá số sau**.
Mọi chỗ `đắc tính ...` lệch trong báo cáo đều là lỗi đó, không phải lỗi của engine này.

## Đọc kết quả
Mỗi script in ra các hạng mục lệch (kèm ví dụ) rồi tổng số hạng mục khớp. Danh sách các chỗ lệch **đã truy nguyên và cố ý giữ**
nằm ở `README.md` gốc, mục “Kiểm chứng”. Khi sửa engine, chạy lại cả 3 script và cập nhật bảng đó.
