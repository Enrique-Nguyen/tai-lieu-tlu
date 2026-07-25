# 📚 TLU Tài Liệu

> Cổng chia sẻ & tra cứu tài liệu học tập dành riêng cho cộng đồng sinh viên **Trường Đại học Thủy Lợi (TLU)**.

---

## 🌟 Giới thiệu

**TLU Tài Liệu** là nền tảng web cho phép sinh viên TLU chia sẻ và tìm kiếm tài liệu học tập một cách dễ dàng — bao gồm đề thi, slide bài giảng, sách/giáo trình và đồ án mẫu — được phân loại theo khoa, bộ môn và môn học.

## ✨ Tính năng

- 🔍 **Tìm kiếm & lọc tài liệu** theo từ khóa, danh mục, khoa, bộ môn
- 📤 **Đăng tải tài liệu** (PDF, DOCX, PPTX...) với mô tả chi tiết
- 💬 **Bình luận & thảo luận** trên từng bài đăng
- 👍 **Vote** (upvote/downvote) tài liệu
- 🔖 **Lưu tài liệu** yêu thích vào danh sách cá nhân
- 🔐 **Xác thực người dùng** qua Supabase Auth (email/password)
- 👤 **Quản lý hồ sơ** cá nhân (họ tên, khoa, lớp, khóa học)
- 🛡️ **Phân quyền** ba cấp: `student` · `moderator` · `admin`
- 🗂️ **Trang Admin** để duyệt/ẩn bài đăng và quản lý báo cáo

## 🛠️ Tech Stack

| Lớp | Công nghệ |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Backend / Database | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Language | TypeScript 5 |
| Icons | [Lucide React](https://lucide.dev) |

## 📁 Cấu trúc dự án

```
tai-lieu-tlu/
├── app/
│   ├── actions/          # Server Actions (post, comment, vote, bookmark...)
│   ├── admin/            # Trang quản trị
│   ├── api/              # API Routes
│   ├── auth/             # Callback xác thực Supabase
│   ├── login/            # Trang đăng nhập
│   ├── post/[id]/        # Chi tiết bài đăng
│   ├── profile/          # Trang hồ sơ cá nhân
│   ├── saved/            # Tài liệu đã lưu
│   ├── upload/           # Trang đăng tải tài liệu
│   └── page.tsx          # Trang chủ (danh sách bài đăng)
├── components/           # UI Components tái sử dụng
├── lib/
│   ├── auth.ts           # Helper lấy thông tin user hiện tại
│   ├── client.ts         # Supabase client-side client
│   ├── constants.ts      # Dữ liệu khoa/bộ môn TLU
│   ├── server.ts         # Supabase server-side client
│   └── utils.ts          # Tiện ích chung
└── proxy.ts              # Next.js 16 Proxy (auth guard, route protection)
```

## 🚀 Cài đặt & Chạy local

### Yêu cầu

- Node.js >= 18
- npm hoặc yarn
- Tài khoản [Supabase](https://supabase.com)

### 1. Clone dự án

```bash
git clone https://github.com/<your-username>/tai-lieu-tlu.git
cd tai-lieu-tlu
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc với nội dung sau:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> ⚠️ **Lưu ý bảo mật:** Không bao giờ commit file `.env.local` lên repository. File này đã được `.gitignore` bỏ qua.

Lấy các giá trị trên tại: **Supabase Dashboard → Project Settings → API**.

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## 📜 Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra lỗi ESLint |

## 🔐 Phân quyền

| Role | Quyền |
|---|---|
| `student` | Xem, đăng tải, bình luận, vote, lưu tài liệu |
| `moderator` | Tất cả quyền của student + duyệt/ẩn bài đăng, xử lý báo cáo |
| `admin` | Toàn quyền, quản lý người dùng và hệ thống |

## 🌐 Deploy

Dự án tương thích với các nền tảng hỗ trợ Node.js server:

- **[Vercel](https://vercel.com)** *(khuyến nghị)* — import repo và thêm biến môi trường trong Project Settings
- **Docker** — build image từ `next build` và chạy với Node.js
- **VPS/Server** — chạy `npm run build && npm run start`

> ⚠️ Static export (`next export`) **không được hỗ trợ** vì dự án sử dụng Server Actions và dynamic routes.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m 'feat: thêm tính năng X'`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

## 📄 License

Dự án được phát hành dưới giấy phép [MIT](LICENSE).

---

<p align="center">Được xây dựng với ❤️ bởi cộng đồng sinh viên TLU</p>
