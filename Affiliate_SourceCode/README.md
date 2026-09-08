# Affiliate System - 2 trang Admin + Client (Mobile mượt) + Google Sheets + Apps Script + Cloudinary

## Cấu trúc
- `backend-appscript/Code.gs` - Backend Apps Script (JWT lưu trong Sheet, API REST)
- `frontend/` - React + Vite + Tailwind, mobile-first 60fps

## 1. Setup Google Sheet
1. Tạo Google Sheet mới
2. Extensions > Apps Script > dán `backend-appscript/Code.gs`
3. Project Properties > Script Properties > thêm `JWT_SECRET` = chuỗi ngẫu nhiên
4. Deploy > New Deployment > Web App > Anyone > Copy URL
5. Mở URL với `?action=initSeed` (POST với token admin) hoặc chạy `seed_()` trong editor để tạo 5 sheet + data mẫu
   - Sheets: Users, Categories, Products, Platforms, Config
   - Tài khoản mặc định: `admin@affiliate.local / admin123`

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
- Client: `http://localhost:5173/` - Responsive, lưới 2 cột mobile, filter chip mượt, lazy image, bottom nav
- Admin: `http://localhost:5173/admin` - CRUD danh mục/sản phẩm, upload Cloudinary lưu URL, config Shopee/TikTok/Lazada

## API
- `GET ?action=getProducts&category=slug&platform=shopee&search=...`
- `GET ?action=getCategories`
- `POST action=login` / `createProduct` / `updateProduct` ... (kèm `token` JWT)

## Deploy production
- Frontend deploy Vercel/Netlify, set env `VITE_API_URL`
- Apps Script đã là backend serverless, không cần server

## Tối ưu mobile mượt
- `will-change: transform`, `translateZ(0)`, grid CSS, `loading=lazy`, `decoding=async`, debounce search, sticky header + horizontal scroll categories không reflow
