/* Tử Vi Thiên Lương — Dữ liệu và hiển thị bài viết
 *
 * Một trang duy nhất (bai-viet.html) làm hai việc:
 *   bai-viet.html              -> danh sách, lọc theo chuyên mục
 *   bai-viet.html#bai-<slug>   -> bài chi tiết
 * Dùng "#" chứ không tách thành nhiều file để giữ đúng bố cục bản demo đã chốt.
 *
 * Thân bài là mảng các khối [kiểu, nội dung]:
 *   p  đoạn văn   h  tiểu mục   ul/ol  danh sách   note  khối nhấn
 *   hours  lưới giờ âm lịch     table  [[tiêu đề...], [hàng...]]
 */
(function (root) {
  'use strict';

  var TAC_GIA = 'Thầy Thiên Lương';

  var POSTS = [
    /* ---- Ba bài đối chiếu trực tiếp với engine an sao của trang ---- */
    {
      slug: 'gio-sinh', cat: 'Trước khi xem lá số', min: 7, date: '18/11/2026',
      title: 'Giờ sinh quyết định cung Mệnh',
      sapo: 'Ngày sinh cho biết sao Tử Vi đứng ở đâu, còn giờ sinh quyết định cung Mệnh nằm ở cung nào. Sai một giờ là lá số nói về một người khác.',
      body: [
        ['p', 'Trong Tử Vi, ngày sinh cho biết sao Tử Vi đứng ở đâu, còn <b>giờ sinh quyết định cung Mệnh nằm ở cung nào</b>. Sai một giờ là cả mười hai cung xoay đi một nấc.'],
        ['h', 'Mười hai giờ âm lịch'],
        ['p', 'Một giờ âm lịch dài hai giờ đồng hồ, và <b>không</b> bắt đầu từ lúc 0 giờ. Giờ Tý vắt qua nửa đêm:'],
        ['hours', [['Tý', '23:00 – 00:59'], ['Sửu', '01:00 – 02:59'], ['Dần', '03:00 – 04:59'], ['Mão', '05:00 – 06:59'],
                   ['Thìn', '07:00 – 08:59'], ['Tỵ', '09:00 – 10:59'], ['Ngọ', '11:00 – 12:59'], ['Mùi', '13:00 – 14:59'],
                   ['Thân', '15:00 – 16:59'], ['Dậu', '17:00 – 18:59'], ['Tuất', '19:00 – 20:59'], ['Hợi', '21:00 – 22:59']]],
        ['p', 'Trang này quy mọi giờ sinh về <b>giờ Việt Nam (GMT+7)</b>.'],
        ['h', 'Cung Mệnh được an thế nào'],
        ['p', 'Quy tắc chỉ có hai bước, bạn có thể tự đếm trên lá số của mình:'],
        ['ol', ['Khởi từ cung <b>Dần</b>, đếm <b>thuận</b> đến tháng sinh âm lịch (tháng Giêng dừng ngay ở Dần, tháng Hai ở Mão…).',
                'Từ cung vừa dừng, đếm <b>nghịch</b> đến giờ sinh (giờ Tý đứng yên, giờ Sửu lùi một cung…). Cung dừng lại chính là <b>cung Mệnh</b>.']],
        ['p', 'Cung <b>Thân</b> an y hệt, chỉ khác bước hai đếm <b>thuận</b> thay vì nghịch. Mười một cung còn lại xếp lần lượt từ cung Mệnh theo chiều thuận của địa bàn: Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ.'],
        ['h', 'Lệch một giờ thì lá số đổi tới đâu'],
        ['p', 'Cùng một người sinh ngày <b>20/02/1999</b>, nam giới, chỉ đổi giờ sinh:'],
        ['table', [['Giờ sinh', 'Giờ âm', 'Mệnh tại', 'Thân cư', 'Cục'],
                   ['5 giờ sáng', 'Mão', 'Hợi', 'Thiên Di', 'Hỏa Lục Cục'],
                   ['7 giờ sáng', 'Thìn', 'Tuất', 'Tài Bạch', 'Hỏa Lục Cục'],
                   ['9 giờ sáng', 'Tỵ', 'Dậu', 'Phu Thê', 'Kim Tứ Cục']]],
        ['p', 'Cung Mệnh đổi kéo theo <b>tên của cả mười hai cung đổi</b>: chùm sao hôm qua nằm ở Quan Lộc thì hôm nay nằm ở Nô Bộc. Ở ví dụ trên, đổi từ 5 giờ sang 9 giờ còn làm <b>Cục đổi hẳn</b> từ Hỏa Lục sang Kim Tứ — sao Tử Vi đứng chỗ khác và tuổi khởi đại vận cũng khác.'],
        ['h', 'Sinh từ 23 giờ đến nửa đêm'],
        ['p', 'Đây là trường hợp dễ sai nhất. Giờ Tý bắt đầu từ 23:00, nên <b>một người sinh lúc 23 giờ 30 ngày mồng 5 được tính là giờ Tý của ngày mồng 6</b> — ngày âm và can chi ngày đều nhảy sang ngày hôm sau, trong khi giờ vẫn là giờ Tý. Vì sao Tử Vi an theo ngày sinh âm lịch, nhảy một ngày là lá số khác.'],
        ['p', 'Có trường phái không tính sang ngày mới. Trang này <b>mặc định tính sang ngày hôm sau</b>, và bạn có thể tắt trong mục <i>Tùy chọn an sao nâng cao</i> ngay dưới form.'],
        ['h', 'Cách đối chiếu lại giờ sinh'],
        ['ul', ['<b>Giấy chứng sinh của bệnh viện</b> — nguồn đáng tin nhất, thường ghi cả giờ và phút.',
                '<b>Giấy khai sinh bản gốc</b> — nhiều mẫu cũ có ghi giờ; bản trích lục đời sau thường cắt mất.',
                '<b>Sổ hộ sinh, sổ khám thai</b>, hoặc giấy ra viện của mẹ.',
                '<b>Trí nhớ của gia đình</b> — hỏi theo mốc sinh hoạt chứ đừng hỏi "mấy giờ": <i>lúc đó nhà đang ăn cơm trưa hay vừa dọn mâm?</i>, <i>trời đã sáng hẳn chưa?</i>. Người ta nhớ việc chứ ít ai nhớ con số.']],
        ['note', 'Nếu giờ sinh rơi sát ranh giới hai giờ âm — ví dụ 02:55 hay 03:05, 06:58 hay 07:02 — hãy lập cả hai lá số và nói rõ với Thầy khi luận giải.']
      ]
    },
    {
      slug: 'lich-am', cat: 'Trước khi xem lá số', min: 6, date: '18/11/2026',
      title: 'Vì sao lịch âm Việt Nam khác lịch âm Trung Quốc',
      sapo: 'Hai nước dùng cùng một phép tính nhưng khác múi giờ. Chỉ riêng chuyện đó đủ làm mùng 1 lệch một ngày, và có năm Tết lệch trọn một tháng.',
      body: [
        ['h', 'Lịch âm thực ra là lịch âm dương'],
        ['p', 'Lịch ta không đếm ngày suông mà bám vào hai hiện tượng thiên văn có thật:'],
        ['ul', ['<b>Điểm sóc</b> — thời khắc Mặt Trăng nằm giữa Trái Đất và Mặt Trời. Ngày chứa điểm sóc là <b>mùng 1</b>.',
                '<b>Trung khí</b> — 12 mốc trên đường đi biểu kiến của Mặt Trời (Vũ Thủy, Xuân Phân, Cốc Vũ…), dùng để đánh số tháng và tìm tháng nhuận.']],
        ['p', 'Cả hai đều là <b>một thời điểm</b>, không phải một ngày. Muốn biết nó rơi vào ngày nào thì phải quy về giờ địa phương — và ở đây hai nước tách nhau: <b>Việt Nam dùng GMT+7, Trung Quốc dùng GMT+8</b>.'],
        ['h', 'Một giờ đồng hồ đẩy lệch cả tháng'],
        ['p', 'Nếu điểm sóc rơi vào khoảng <b>23:00 – 23:59 giờ Việt Nam</b> thì ở Trung Quốc đồng hồ đã sang ngày hôm sau. Cùng một hiện tượng, hai nước ghi vào hai ngày khác nhau, nên <b>mùng 1 lệch một ngày</b> và cả tháng âm lệch theo.'],
        ['p', 'Chuyện đáng kể hơn nằm ở <b>tháng nhuận</b>. Một năm âm có 13 tháng khi trong năm xuất hiện một tháng <b>không chứa trung khí nào</b> — tháng đó thành tháng nhuận. Vì trung khí cũng là một thời điểm, lệch một giờ có thể đẩy nó từ ngày cuối tháng này sang ngày đầu tháng sau, và tháng nhuận nhảy sang chỗ khác — hoặc biến mất.'],
        ['h', 'Ví dụ: Tết 1985 lệch trọn một tháng'],
        ['p', 'Theo lịch Việt Nam (GMT+7), năm Giáp Tý 1984 <b>không có tháng nhuận</b>. Theo lịch Trung Quốc (GMT+8), năm đó <b>nhuận tháng 10</b> — dôi ra hẳn một tháng. Hệ quả:'],
        ['table', [['', 'Lịch Việt Nam (GMT+7)', 'Lịch Trung Quốc (GMT+8)'],
                   ['Nhuận năm 1984', 'Không có', 'Nhuận tháng 10'],
                   ['Mùng 1 Tết Ất Sửu', '21/01/1985', '20/02/1985']]],
        ['p', 'Một người sinh đầu tháng 2 năm 1985: theo lịch Việt Nam đã là <b>năm Ất Sửu</b>, theo lịch Trung Quốc vẫn còn là <b>năm Giáp Tý</b>. Can chi năm khác nhau thì Tứ Hóa khác, Lộc Tồn khác, đại vận khác — lá số lệch từ gốc chứ không phải lệch vài sao lẻ.'],
        ['h', 'Trang này tính theo lịch nào'],
        ['p', 'Lịch âm ở đây dùng thuật toán của <b>Hồ Ngọc Đức</b>, quy về <b>GMT+7</b>, tức là đúng cuốn lịch treo tường ở Việt Nam. Đó cũng là lịch mà trường phái Tử Vi Việt Nam dùng để an sao.'],
        ['p', 'Nếu bạn chỉ nhớ ngày âm, hãy chọn <i>Âm lịch</i> ngay trong form — trang sẽ đổi ngược ra ngày dương và hiện can chi năm để bạn đối chiếu. Nếu ngày âm đó chép từ một trang Trung Quốc, hãy đối chiếu lại bằng ngày dương: <b>ngày dương không bao giờ sai</b>.']
      ]
    },
    {
      slug: 'doc-la-so', cat: 'Trước khi xem lá số', min: 8, date: '18/11/2026',
      title: 'Đọc lá số: Mệnh, Thân, Cục và tam phương tứ chính',
      sapo: 'Một lá số có hơn một trăm sao, nhìn vào rất dễ rối. Bốn khái niệm dưới đây đủ để bạn biết mình đang nhìn vào đâu.',
      body: [
        ['h', '1. Mười hai cung'],
        ['p', 'Lá số là một địa bàn mười hai cung cố định theo chi (Tý, Sửu, Dần… Hợi). Cái thay đổi theo từng người là <b>tên cung</b> dán lên đó. Kể từ cung Mệnh, đếm thuận:'],
        ['table', [['Cung', 'Nói về', 'Cung', 'Nói về'],
                   ['Mệnh', 'Bản chất, tính cách gốc', 'Thiên Di', 'Ra ngoài, đi xa, người đời nhìn mình'],
                   ['Phụ Mẫu', 'Cha mẹ, bề trên', 'Tật Ách', 'Sức khỏe, tai nạn'],
                   ['Phúc Đức', 'Phúc phần, đời sống tinh thần', 'Tài Bạch', 'Tiền bạc'],
                   ['Điền Trạch', 'Nhà cửa, đất đai', 'Tử Tức', 'Con cái'],
                   ['Quan Lộc', 'Sự nghiệp, công danh', 'Phu Thê', 'Vợ chồng'],
                   ['Nô Bộc', 'Bạn bè, cấp dưới', 'Huynh Đệ', 'Anh chị em']]],
        ['h', '2. Mệnh và Thân'],
        ['p', 'Người ta hay nói <b>Mệnh là cái trời cho, Thân là cái mình làm ra</b>. Mệnh thiên về bẩm sinh và nửa đời trước; Thân là chỗ con người dồn sức, thường nặng dần về nửa đời sau.'],
        ['p', 'Thân không rơi tự do: nó <b>chỉ cư ở một trong sáu cung</b> — Mệnh, Phúc Đức, Quan Lộc, Thiên Di, Tài Bạch, Phu Thê. Thân cư Mệnh là người trước sau như một; Thân cư Thiên Di là người làm nên ở ngoài quê; Thân cư Phu Thê là đời mình gắn chặt với người bạn đời. Trên lá số, cung giữ Thân có gắn nhãn <b>THÂN</b>.'],
        ['h', '3. Cục'],
        ['p', 'Cục lấy từ nạp âm của can–chi <b>cung Mệnh</b>, có năm loại. Nó không phải lời phán hay dở, mà là con số điều khiển hai thứ: sao Tử Vi đứng ở đâu (tính theo ngày sinh âm lịch), và <b>đại vận bắt đầu từ tuổi nào</b>:'],
        ['table', [['Cục', 'Số', 'Đại vận đầu bắt đầu'],
                   ['Thủy Nhị Cục', '2', '2 tuổi'], ['Mộc Tam Cục', '3', '3 tuổi'],
                   ['Kim Tứ Cục', '4', '4 tuổi'], ['Thổ Ngũ Cục', '5', '5 tuổi'],
                   ['Hỏa Lục Cục', '6', '6 tuổi']]],
        ['p', 'Mỗi đại vận kéo dài mười năm. Trên lá số, con số ở góc phải mỗi cung chính là tuổi khởi đại vận của cung đó.'],
        ['h', '4. Tam phương tứ chính'],
        ['p', 'Đây là chỗ dễ đọc sai nhất. <b>Không bao giờ đọc một cung đứng một mình.</b> Mỗi cung luôn được đọc cùng ba cung khác:'],
        ['ul', ['<b>Tam phương</b> — hai cung tam hợp, cách cung đang xem 4 cung và 8 cung.',
                '<b>Tứ chính</b> — thêm cung <b>xung chiếu</b>, nằm đối diện, cách 6 cung.']],
        ['p', 'Với cung Mệnh, tam phương tứ chính luôn là <b>Quan Lộc, Tài Bạch</b> và <b>Thiên Di</b>. Muốn hiểu một người thì phải xem cùng lúc: bản chất, sự nghiệp, tiền bạc và cách người đời nhìn họ.'],
        ['note', 'Trên lá số của trang này, rê chuột (hoặc chạm trên điện thoại) vào một cung là tam phương tứ chính của cung đó sáng lên, kèm tam giác tam hợp và nét đứt xung chiếu.'],
        ['h', 'Vài ký hiệu trên lá số'],
        ['ul', ['<b>14 chính tinh</b> in hoa ở giữa mỗi cung. Cung không có chính tinh nào gọi là <b>vô chính diệu</b> — khi luận, thường mượn chính tinh của cung xung chiếu.',
                '<b>(M) (V) (Đ) (B) (H)</b> là độ sáng của sao: Miếu, Vượng, Đắc, Bình, Hãm.',
                '<b>L.</b> là sao lưu niên của năm đang xem, <b>ĐV.</b> là sao đại vận.',
                '<b>Tuần</b> và <b>Triệt</b> nằm trên cạnh chung của hai cung, làm "nghẽn" sức của các sao trong cặp cung đó.']],
        ['h', 'Trình tự nên đọc'],
        ['ol', ['Cung <b>Mệnh</b> cùng tam phương tứ chính của nó.',
                'Cung giữ <b>Thân</b> — xem đời người dồn về đâu.',
                '<b>Đại vận</b> đang đi (10 năm).',
                '<b>Lưu niên</b> và <b>nguyệt hạn</b> — chuyện của năm và của tháng.']],
        ['note', 'Lá số là tấm bản đồ, không phải bản án. Nó cho biết địa hình, còn đi đường nào là chuyện của người cầm bản đồ.']
      ]
    },

    /* ---- Bốn bài theo bản demo đã chốt với khách ---- */
    {
      slug: 'tam-phuong-tu-chinh', cat: 'Phương pháp luận', min: 6, date: '12/11/2026',
      title: 'Đọc lá số theo tam phương tứ chính: vì sao không xét một cung đơn lẻ',
      sapo: 'Một cung chỉ là một góc nhìn. Bản cung, hai cung tam hợp và cung xung chiếu mới tạo thành bức tranh đủ để luận.',
      body: [
        ['p', 'Người mới học thường dừng ở câu hỏi: cung Mệnh có sao gì. Cách đọc đó bỏ qua phần lớn thông tin của lá số.'],
        ['h', 'Bốn cung, một hệ thống'],
        ['p', 'Tam phương tứ chính gồm bản cung, hai cung tam hợp và cung xung chiếu. Với Mệnh ở Ngọ, tam hợp là Dần và Tuất, xung chiếu là Tý. Sao ở bốn cung này cùng tác động lên bản cung, mức độ khác nhau.'],
        ['h', 'Đọc lực, không đọc nhãn'],
        ['p', 'Một chính tinh miếu địa được tam hợp hỗ trợ khác hẳn cùng chính tinh đó khi xung chiếu có sát tinh. Người luận cần cân lực các bên trước khi kết luận, thay vì đọc từng sao như đọc từ điển.'],
        ['p', 'Đây là nền của mọi buổi luận giải tại Tử Vi Thiên Lương: lập luận có căn cứ, nói rõ vì sao đi đến kết luận.']
      ]
    },
    {
      slug: 'sao-thien-luong', cat: 'Sao & Cung', min: 5, date: '05/11/2026',
      title: 'Thiên Lương: ngôi sao của người che chở',
      sapo: 'Thiên Lương thuộc Nam Đẩu, hóa khí là Ấm. Hiểu đúng sao này giúp hiểu vì sao có người sinh ra để làm thầy, làm chỗ dựa.',
      body: [
        ['p', 'Trong các chính tinh, Thiên Lương mang tính chất của bậc trưởng thượng: bao dung, nguyên tắc, thích bảo vệ người khác.'],
        ['h', 'Hóa khí là Ấm'],
        ['p', 'Ấm là che chở, là phúc ấm. Người có Thiên Lương đắc lực thường được quý nhân nâng đỡ và cũng có xu hướng nâng đỡ người khác. Đó là lý do sao này gắn với nghề thầy, nghề tư vấn, nghề y.'],
        ['h', 'Mặt trái cần biết'],
        ['p', 'Khi gặp sát tinh, tính bao bọc dễ thành áp đặt, thích dạy người. Luận Thiên Lương vì thế phải xét cung đóng và các sao đi cùng, không chỉ đọc mặt tốt.']
      ]
    },
    {
      slug: 'dai-van-10-nam', cat: 'Vận hạn', min: 7, date: '28/10/2026',
      title: 'Đại vận 10 năm: đọc như một chương sách, không phải một lời phán',
      sapo: 'Mỗi đại vận là bối cảnh của một giai đoạn. Biết mình đang ở chương nào giúp chọn việc đúng lúc, thay vì lo lắng vô căn cứ.',
      body: [
        ['p', 'Đại vận chuyển cung mỗi 10 năm. Cung đại vận cho biết chủ đề nổi bật của giai đoạn: tài chính, nhà đất, sự nghiệp hay các mối quan hệ.'],
        ['h', 'Bối cảnh trước, sự kiện sau'],
        ['p', 'Lưu niên và nguyệt hạn chỉ có nghĩa khi đặt trong đại vận. Một năm thuận trong đại vận khó khăn khác với một năm thuận trong đại vận hanh thông.'],
        ['h', 'Dùng đại vận để quyết định'],
        ['p', 'Câu hỏi đúng không phải năm nay tốt hay xấu, mà là giai đoạn này nên tập trung vào việc gì. Đó là cách Thầy hướng dẫn khách hàng đọc vận hạn.']
      ]
    },
    {
      slug: 'tu-vi-dung-nhan', cat: 'Ứng dụng kinh doanh', min: 6, date: '20/10/2026',
      title: 'Tử Vi trong dụng nhân: hiểu tính cách để giao đúng việc',
      sapo: 'Chủ doanh nghiệp không cần đoán người. Lá số là một công cụ tham khảo để hiểu sở trường và cách làm việc của nhân sự chủ chốt.',
      body: [
        ['p', 'Nhiều sai lầm trong quản trị nhân sự đến từ việc giao sai việc cho đúng người. Tử Vi cung cấp thêm một lăng kính để hiểu xu hướng hành xử.'],
        ['h', 'Đọc cung Mệnh và Quan Lộc'],
        ['p', 'Mệnh cho thấy khí chất; Quan Lộc cho thấy cách người đó làm việc và gánh trách nhiệm. Người hợp vai khai phá khác người hợp vai giữ nền.'],
        ['h', 'Tham khảo, không thay thế'],
        ['p', 'Lá số không thay cho phỏng vấn, đánh giá năng lực hay pháp luật lao động. Nó giúp nhà quản lý đặt câu hỏi tốt hơn khi bố trí con người.']
      ]
    }
  ];

  var CATS = ['Tất cả'].concat(POSTS.map(function (p) { return p.cat; })
    .filter(function (c, i, a) { return a.indexOf(c) === i; }));

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Tranh đầu bài: vẽ bằng SVG nội tuyến, không phải ảnh -> không thêm request nào */
  function artSvg(cat, i) {
    var pal = ['#3b1d5d', '#4c286e', '#5e3786', '#2a1546'];
    var x = 250 - (i % 4) * 40;
    return '<svg class="art" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="320" height="140" fill="' + pal[i % 4] + '"/>' +
      '<g fill="none" stroke="#c9a56b" stroke-opacity=".55">' +
      '<circle cx="' + x + '" cy="70" r="90"/><circle cx="' + x + '" cy="70" r="62"/>' +
      '<line x1="' + (x - 90) + '" y1="70" x2="' + (x + 90) + '" y2="70"/>' +
      '<line x1="' + x + '" y1="-20" x2="' + x + '" y2="160"/>' +
      '<path d="M' + x + ' 8 L' + (x + 54) + ' 102 L' + (x - 54) + ' 102 Z"/></g>' +
      '<text x="18" y="122" fill="#e8cf9f" font-family="Be Vietnam Pro,sans-serif" font-size="11" letter-spacing="2">' +
      esc(cat.toUpperCase()) + '</text></svg>';
  }

  /** Một khối thân bài -> HTML. Nội dung trong dữ liệu đã là HTML có kiểm soát. */
  function blockHtml(b) {
    var k = b[0], v = b[1];
    if (k === 'h') return '<h3>' + v + '</h3>';
    if (k === 'p') return '<p>' + v + '</p>';
    if (k === 'note') return '<p class="callout">' + v + '</p>';
    if (k === 'ul' || k === 'ol') {
      return '<' + k + '>' + v.map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</' + k + '>';
    }
    if (k === 'hours') {
      return '<ul class="hour-grid">' + v.map(function (r) {
        return '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>';
      }).join('') + '</ul>';
    }
    if (k === 'table') {
      var head = v[0], rows = v.slice(1);
      return '<div class="table-scroll"><table class="post-table"><thead><tr>' +
        head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' + rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }
    return '';
  }

  function cardHtml(p, i) {
    return '<a class="post" href="#bai-' + p.slug + '">' + artSvg(p.cat, i) +
      '<span class="body"><span class="eyebrow">' + esc(p.cat) + '</span>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<span class="sapo">' + esc(p.sapo) + '</span>' +
      '<span class="meta">' + esc(p.date) + ' · ' + p.min + ' phút đọc</span></span></a>';
  }

  function articleHtml(p, logo) {
    var rel = POSTS.filter(function (x) { return x !== p; }).slice(0, 3);
    return '<a class="back" href="bai-viet.html">← Tất cả bài viết</a>' +
      '<span class="eyebrow">' + esc(p.cat) + '</span>' +
      '<h1>' + esc(p.title) + '</h1>' +
      '<div class="byline"><img src="' + logo + '" alt="" width="40" height="40">' +
      '<span><b style="color:var(--tl-text)">' + esc(TAC_GIA) + '</b><br>' +
      esc(p.date) + ' · ' + p.min + ' phút đọc</span></div>' +
      '<div class="content">' + p.body.map(blockHtml).join('') + '</div>' +
      '<div class="panel endcta"><span class="eyebrow">Luận giải lá số của bạn</span>' +
      '<b style="font-size:17px">Muốn biết lá số của mình nói gì về điều này?</b>' +
      '<p class="muted" style="font-size:14px">Gửi lá số và câu hỏi, Thầy Thiên Lương sẽ luận giải trực tiếp.</p>' +
      '<a class="btn btn-gold" href="dat-lich.html">Đặt lịch luận giải</a></div>' +
      '<div class="rel"><span class="eyebrow">Bài liên quan</span>' +
      rel.map(function (r) { return '<a href="#bai-' + r.slug + '">' + esc(r.title) + '</a>'; }).join('') +
      '</div>';
  }

  root.TVTLPosts = {
    POSTS: POSTS, CATS: CATS,
    cardHtml: cardHtml, articleHtml: articleHtml, blockHtml: blockHtml, esc: esc,
    find: function (slug) {
      return POSTS.filter(function (p) { return p.slug === slug; })[0] || null;
    }
  };
})(this);
