# Skola Frontend — Module Nhà tài trợ (Partner)

Frontend React cho nền tảng học bổng Skola. Repo này build theo **kiểu module tách biệt** để nhiều người cùng code chung một project mà không đụng nhau — xem [Cấu trúc & quy ước module](#cấu-trúc--quy-ước-module).

Phần đã triển khai đầy đủ trong lần này: **module `partner` (Nhà tài trợ)** — toàn bộ các trang trong thư mục `PNG/` gốc: Tổng quan thống kê, Quản lý học bổng, Tạo/sửa học bổng, Hồ sơ nhà tài trợ (xem + sửa), Cài đặt tài khoản, Mật khẩu và bảo mật. Module `auth` (đăng ký/đăng nhập/OTP) cũng được xây đầy đủ vì mọi module khác đều cần dùng chung.

## Chạy dự án

```bash
npm install
cp .env.example .env   # hoặc copy .env.example .env trên Windows
npm run dev
```

Mặc định chạy ở `http://localhost:5173`.

## Backend & CORS

Backend deploy tại `https://tttn-five.vercel.app` **đã bật CORS** (`app.use(cors())`, mọi origin, xác minh qua preflight `OPTIONS` trả `Access-Control-Allow-Origin: *`). Frontend gọi thẳng backend, không qua proxy/rewrite:

- `VITE_API_BASE_URL` trong `.env` trỏ thẳng `https://tttn-five.vercel.app/api/v1`.
- `vite.config.ts` không còn `server.proxy`, `vercel.json` không còn `rewrites` — cả hai từng dùng để né CORS khi backend chưa bật, nay không cần nữa.
- Nếu sau này cần đổi sang gọi qua proxy/rewrite lần nữa (ví dụ muốn giấu origin thật của backend), khôi phục lại cấu hình proxy tương ứng và đổi `VITE_API_BASE_URL` về `/api/v1`.

Spec OpenAPI đầy đủ (dùng để đối chiếu field/response khi code) nằm ở file `Nền tảng Học bổng API.json` tại thư mục gốc repo.

## Cấu trúc & quy ước module

```text
src/
├── app/                 # Composition root: routes, ProtectedRoute
├── shared/              # DÙNG CHUNG cho mọi module — không chứa logic nghiệp vụ riêng
│   ├── api/              # axios instance (auto refresh token), types lỗi/pagination chung
│   ├── components/ui/    # Button, Input, Select, Card, Badge, Pagination, Toast... — design system
│   ├── components/layout/# SiteHeader, SiteFooter, Logo — khung trang dùng chung
│   ├── config/, hooks/, lib/
└── modules/
    ├── auth/             # Đăng ký/đăng nhập/OTP/quên mật khẩu — DÙNG CHUNG, mọi vai trò đều qua đây
    └── partner/           # Module Nhà tài trợ — ĐÃ XONG (xem PNG gốc)
        ├── api/            # 1 file gọi API cho mỗi nhóm resource (partnerProfile, scholarships, tags)
        ├── components/     # Component riêng của module: layout, sidebar, form, badge...
        ├── pages/          # 1 file = 1 route
        └── types.ts
```

**Khi thêm module mới (candidate, mentor, admin...):** tạo thư mục riêng dưới `src/modules/<ten-module>/` theo đúng pattern trên (api/ + components/ + pages/ + types.ts), chỉ import từ `shared/` và `modules/auth/`, **không import chéo** giữa `modules/partner` và module khác. Mỗi module tự đăng ký route của mình — xem cách `App.tsx` khai báo route để thêm nhánh `<Route>` mới, tránh sửa lung tung vào phần route của module khác khi merge.

## Những gì backend CHƯA hỗ trợ (đã xử lý minh bạch trên UI)

Một số phần trong thiết kế PNG gốc không có API/field tương ứng ở backend hiện tại (xem `CLAUDE.md`, `README_CSDL.md` ở thư mục gốc). Thay vì giả lập số liệu, các trang liên quan hiển thị khối thông báo "chưa hỗ trợ" ngay tại vị trí đó trong UI:

- **Danh sách hồ sơ ứng tuyển theo từng ứng viên** (xem/duyệt từng đơn trong một học bổng cụ thể) — backend có `PATCH /interactions/:id/status` để đối tác duyệt/từ chối một tương tác, nhưng chưa có endpoint liệt kê các tương tác (`interactions`) theo `scholarship_id` cho phía đối tác, nên UI chưa dựng được màn "Quản lý ứng viên" theo từng học bổng. Số liệu tổng hợp (`GET /partners/me/stats`) đã dùng được và đã lên `DashboardPage`/`ScholarshipListPage`.
- **So sánh theo thời gian** và **Ngân sách** trên Dashboard — không có dữ liệu chuỗi thời gian hay ngân sách ở backend.
- **Quản lý hồ sơ ứng viên**, **Quản lý ngân sách**, **Quản lý giao dịch**, **Thông báo qua email** — không có model/endpoint tương ứng.
- **Họ tên, số điện thoại, đổi email** — bảng `users` chỉ có `email`, `password_hash`, `role`.
- **Bảo mật hai lớp (2FA)** — backend xác nhận không có MFA/OAuth/CAPTCHA.
- Một số field trong form hồ sơ/học bổng ở PNG (năm thành lập, trụ sở, quy mô, ảnh đại diện học bổng, ngày bắt đầu nhận hồ sơ, quyền lợi tuỳ chỉnh, hồ sơ yêu cầu...) không có cột lưu trữ tương ứng.

Khi backend bổ sung API cho các phần trên, tìm từ khoá `UnsupportedNotice` trong `src/modules/partner` để thay bằng dữ liệu thật.

## Đổi mật khẩu khi đã đăng nhập

Backend chỉ có luồng đổi mật khẩu qua OTP (`/auth/password/forgot` + `/auth/password/reset`), không có endpoint "đổi mật khẩu bằng mật khẩu cũ". Trang **Mật khẩu và bảo mật** vì vậy dùng lại luồng OTP: gửi mã tới email của chính người dùng rồi xác nhận.
