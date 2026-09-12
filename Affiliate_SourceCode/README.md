# Affiliate System - 2 trang Admin + Client (Mobile mượt) + Google Sheets + Apps Script + Cloudinary

## Cấu trúc
- `backend-appscript/Code.gs` - Backend Apps Script (JWT lưu trong Sheet, API REST)
- `frontend/` - React + Vite + Tailwind, mobile-first 60fps

## 1. Setup Google Sheet
1. Tạo Google Sheet mới
2. Extensions > Apps Script > dán `backend-appscript/Code.gs`
3. Project Properties > Script Properties > thêm `JWT_SECRET` = chuỗi ngẫu nhiên
4. Deploy > New Deployment > Web App > Anyone > Copy URL
5. Thêm `ADMIN_EMAIL` và `ADMIN_PASSWORD` vào Script Properties, sau đó chạy `seed_()` trong Apps Script editor để tạo các sheet + data mẫu. Không có tài khoản hoặc mật khẩu mặc định trong source.
   - Sheets: Users, Categories, Products, Platforms, Config, PromotionRequests

## 2. Setup Cloudinary
- cloudinary.com > Settings > Upload > Upload Presets > Create **Unsigned** preset (vd `affiliate`)
- Lấy Cloud Name, điền vào Admin > Cấu hình

## 3. Chạy Frontend
```bash
cd frontend
npm install
cp ../.env.example .env
# sửa VITE_API_URL thành URL Web App
npm run dev
```
- Client: `http://localhost:5173/` - Responsive, lưới sản phẩm, filter chip, lazy image
- Request: `http://localhost:5173/dang-ky-gioi-thieu` - Form đăng ký giới thiệu sản phẩm
- Admin: `http://localhost:5173/admin` - CRUD sản phẩm/danh mục, quản lý yêu cầu, contact admin, Cloudinary và nền tảng

## API
- `GET ?action=getProducts&category=slug&platform=shopee&search=...`
- `GET ?action=getCategories`
- `POST action=login` / `createProduct` / `updateProduct` ... (kèm `token` JWT)

## Deploy production
- Frontend deploy Vercel/Netlify, set env `VITE_API_URL`
- Apps Script đã là backend serverless, không cần server

## Tối ưu mobile mượt
- `will-change: transform`, `translateZ(0)`, grid CSS, `loading=lazy`, `decoding=async`, debounce search, sticky header + horizontal scroll categories không reflow
