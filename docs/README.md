# docs/ — tài liệu gửi khách (không publish)

Tài liệu đề xuất **trang quản trị nội dung (admin)** cho website Thiên Lương.
Mới dừng ở mức đề xuất — chưa viết dòng mã nào cho phần quản trị.

Viết cho **chủ website đọc**: không dùng từ kỹ thuật, và **cố ý không nói** về hạ tầng, hosting,
phương án triển khai hay ước lượng người-ngày. Giữ nguyên nguyên tắc đó khi sửa lại tài liệu.

| Tệp | Là gì |
|---|---|
| `De-xuat-trang-quan-tri-website-Thien-Luong.docx` | Bản gửi khách — 6 mục, 12 hình |
| `_make-docx.py` | Sinh file .docx ở trên — `py docs/_make-docx.py` |
| `admin-mockup/index.html` | **Một tệp duy nhất** chứa cả 10 màn quản trị, bấm menu để đi qua lại. CSS + logo nhúng sẵn bên trong, mở bằng trình duyệt là chạy. Sinh bằng `node docs/admin-mockup/_build.js` (nguồn: `_build.js`, `_css.css`, `_logo.svg`) |
| `_annot.js` | Sinh 2 bản sao trang client có đánh số vùng nội dung — `node docs/_annot.js` |
| `img/` | Ảnh chèn vào .docx: `A-`, `B-` chụp web thật; `01`–`10` chụp từng màn của mockup |

## Dựng lại toàn bộ ảnh

```sh
node docs/admin-mockup/_build.js       # sinh index.html (1 tệp, 10 màn)
node docs/_annot.js                    # sinh _annot-home.html, _annot-chart.html ở GỐC dự án
# chụp bằng Chrome headless, --force-device-scale-factor=2, kích thước lấy trong admin-mockup/_pages.json
#   từng màn: index.html?clean#<route>   (thêm ?clean để ẩn dòng nhắc ở góc)
#   trang client: 1440x1360 (trang chủ) và 1440x2120 (trang lá số, kèm tham số lá số sau dấu #)
rm _annot-home.html _annot-chart.html  # XÓA ngay, không để lọt vào dist/
py docs/_make-docx.py
```

Hai tệp `_annot-*.html` phải đặt ở gốc dự án thì đường dẫn `assets/...` mới đúng; nhớ xóa sau khi chụp.

Phạm vi tài liệu bám đúng những gì **2 trang client hiện có** — mỗi lần đổi giao diện thì rà lại
bảng kiểm kê ở mục 4 của `_make-docx.py` (25 vùng nội dung) trước khi gửi lại cho khách.
