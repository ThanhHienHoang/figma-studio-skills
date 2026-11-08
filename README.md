# figma-studio-skills

Bộ skill cho Claude Code để làm thiết kế **thẳng trên Figma**. Ý tưởng lấy từ repo
[jimliu/baoyu-design](https://github.com/jimliu/baoyu-design), nhưng khác ở chỗ: repo gốc xuất ra
file HTML/JSON và mở trong trình chỉnh sửa riêng, còn bộ này vẽ mọi thứ ngay trong file Figma của
bạn, thông qua figma-console MCP.

## Có gì bên trong

| Skill | Làm gì | Kết quả nằm ở đâu trong Figma |
|---|---|---|
| `figma-slides` | Làm bộ slide thuyết trình | Slide thật trong file Figma Slides, hoặc các khung 1920 x 1080 trong file thiết kế thường |
| `figma-canvas` | Mockup, landing page, poster, wireframe, prototype bấm được, nhiều phương án đặt cạnh nhau | Các khung (artboard) xếp hàng ngang trong một Section |
| `figma-design-system` | Tạo hoặc nhập design system: màu, chữ, khoảng cách, component, trang hướng dẫn | Variables (có chế độ Sáng/Tối), text style, component có biến thể, các trang Cover / Foundations / Components / Guidelines |
| `figma-dashboard` | Biến dữ liệu thật (CSV, JSON...) thành dashboard | Một khung dashboard có ô số liệu, biểu đồ, bảng, và phần "Sources" ghi rõ mỗi con số lấy từ đâu |
| `figma-motion` | Video hoạt hình ngắn bằng Figma Motion | Mỗi cảnh là một khung có animation, xuất ra MP4 / GIF |
| `figma-motion-director` | "Đạo diễn" video có lời thuyết minh: chốt ý chính, viết lời, lồng tiếng, canh thời gian từng cảnh | Dùng chung với `figma-motion` |

Thư mục `skills/_shared/` là phần dùng chung cho cả 6 skill:
- `figma-workflow.md`: quy trình chung (kết nối Figma, đặt bản vẽ ở đâu, kiểm tra độ tương phản, chụp màn hình để soát lỗi).
- `figma-snippets.js`: vài hàm nhỏ giúp vẽ nhanh trong Figma (tạo chữ, tạo khung tự dàn trang, kiểm tra màu chữ có đủ rõ không...).

Bộ này không kèm skill vẽ biểu đồ riêng. Nếu Claude Code của bạn có skill `dataviz`, skill
dashboard và slide sẽ dùng nó khi vẽ biểu đồ; không có thì vẫn chạy bình thường.

## Cần có gì trước

1. **Figma Desktop** (bản cài trên máy, không phải bản web).
2. **[figma-console MCP](https://github.com/southleft/figma-console-mcp)** đã được cài cho Claude Code.
3. Mở file Figma muốn làm, rồi chạy plugin **Desktop Bridge** (đi kèm figma-console MCP) trong file
   đó. Không có bước này thì Claude không "nhìn" và "vẽ" được vào Figma.
4. Với `figma-motion`: cần `ffmpeg` (để ghép các cảnh và lồng tiếng). Trên Mac cài bằng
   `brew install ffmpeg`.

## Cài đặt

Tải bộ skill về và chạy lệnh cài một lần:

```sh
git clone https://github.com/ThanhHienHoang/figma-studio-skills.git ~/figma-studio-skills
sh ~/figma-studio-skills/install.sh
```

Lệnh này tạo "lối tắt" (symlink) từ thư mục `~/.claude/skills/` trỏ về các thư mục skill trong thư
mục vừa tải. Nó **bỏ qua** những gì đã có sẵn, nên không ghi đè skill nào của bạn. Vì là lối tắt,
muốn cập nhật bản mới chỉ cần `git pull` trong thư mục đó. Đừng xoá hay đổi tên thư mục này sau khi
cài, nếu không lối tắt sẽ hỏng.

Muốn gỡ: xoá các lối tắt trong `~/.claude/skills/` có tên `figma-slides`, `figma-canvas`,
`figma-design-system`, `figma-dashboard`, `figma-motion`, `figma-motion-director`, `_shared`.

Sau khi cài, mở phiên Claude Code mới để nó nhận skill.

## Cách dùng

Cứ nói bình thường, ví dụ:

- "Làm cho tôi bộ slide 8 trang giới thiệu sản phẩm X trong file Figma đang mở"
- "Thiết kế 3 phương án hero cho landing page bán cà phê, đặt cạnh nhau"
- "Tạo design system từ code trong repo này, có chế độ tối"
- "Đây là file doanh_thu.csv, làm dashboard tổng quan quý 3 trên Figma"
- "Làm video 15 giây giới thiệu app, xuất MP4"

Hoặc gọi thẳng tên skill: `/figma-slides`, `/figma-canvas`...

## Khác gì so với repo gốc

- Repo gốc: kết quả là file trên ổ đĩa, mở bằng trình chỉnh sửa riêng chạy trên máy (có chia sẻ
  qua mạng LAN, lịch sử phiên bản, bình luận).
- Bộ này: kết quả nằm trong Figma. Chia sẻ, bình luận, lịch sử phiên bản, trình chiếu và xuất
  file (PDF, PNG...) dùng luôn tính năng có sẵn của Figma.
- Dashboard trên Figma là "ảnh chụp" số liệu tại một thời điểm, không tự cập nhật. Muốn số mới thì
  nhờ Claude chạy lại và cập nhật.
- Figma không có âm thanh, nên nhạc và lời thuyết minh được ghép vào sau khi xuất video.

## Ghi chú bản quyền

Các file trong thư mục này được viết mới cho Figma, chỉ tham khảo cấu trúc và các nguyên tắc thiết
kế của repo gốc, không chép nguyên văn. Phần nội dung gốc của repo kia (lấy từ Anthropic) không nằm
trong thư mục này. Xem điều khoản của repo gốc tại
https://github.com/jimliu/baoyu-design/blob/main/NOTICE.md

## Giấy phép

MIT: ai cũng được dùng, sửa và chia sẻ lại miễn phí, chỉ cần giữ dòng ghi bản quyền. Xem file
[LICENSE](LICENSE).
