# 📖 คู่มือการรัน Frontend และ Backend

## 🎯 ภาพรวม

โปรเจกต์นี้ใช้ **Next.js 15** ซึ่งเป็น **Full-Stack Framework** ที่รวม Frontend และ Backend ไว้ด้วยกัน:
- **Frontend**: Next.js App Router + React + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes + Prisma ORM + MySQL Database

**หมายเหตุ:** ไม่ต้องรันแยกกัน เพราะ Next.js รันทั้ง Frontend และ Backend ในคำสั่งเดียว!

---

## ✅ ขั้นตอนการรัน

### 1. ตรวจสอบ Prerequisites

#### 1.1 ตรวจสอบ MySQL Service (Laragon)
- เปิด Laragon
- ตรวจสอบว่า MySQL service ทำงานอยู่ (สีเขียว)
- Port: `3306`

#### 1.2 ตรวจสอบ Database
```sql
-- ตรวจสอบว่า database `nitesa` มีอยู่
-- ผ่าน phpMyAdmin หรือ MySQL Terminal
```

#### 1.3 ตรวจสอบไฟล์ `.env`
```env
# Database - MySQL (Laragon)
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"

# NextAuth
NEXTAUTH_SECRET="Ub1osSBMdYcPm+laAZUPO1HveAS17caGqVediHOjD5M="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

### 2. Setup Database (ครั้งแรกเท่านั้น)

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Run migrations (สร้าง tables)
npm run db:migrate

# 3. Seed data (ข้อมูลตัวอย่าง - optional)
npm run db:seed
```

---

### 3. รัน Development Server

#### วิธีที่ 1: รันด้วย npm (แนะนำ)
```bash
npm run dev
```

#### วิธีที่ 2: รันด้วย PowerShell
```powershell
npm run dev
```

**ผลลัพธ์:**
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://localhost:3000/api/*
- ✅ Hot Reload: เปิดใช้งานอัตโนมัติ

---

## 🚀 คำสั่งที่ใช้บ่อย

### Development
```bash
# รัน development server (Frontend + Backend)
npm run dev

# Build สำหรับ production
npm run build

# รัน production server
npm run start
```

### Database
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# เปิด Prisma Studio (GUI สำหรับดู database)
npm run db:studio
```

### Utilities
```bash
# Lint code
npm run lint

# Run tests
npm run test

# Run tests (watch mode)
npm run test:watch
```

---

## 📂 โครงสร้าง Backend API

Backend API อยู่ในโฟลเดอร์ `app/api/`:

```
app/api/
├── auth/              # Authentication endpoints
├── schools/           # School management
├── supervisions/      # Supervision CRUD
├── reports/           # Report generation
└── uploads/           # File upload
```

**ตัวอย่าง API Endpoints:**
- `GET /api/schools` - ดึงรายการโรงเรียน
- `POST /api/supervisions` - สร้างการนิเทศ
- `GET /api/reports/excel` - Export Excel

---

## 🔍 ตรวจสอบว่าระบบทำงาน

### 1. ตรวจสอบ Frontend
เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

### 2. ตรวจสอบ Backend API
```bash
# ตัวอย่าง: ตรวจสอบ API endpoint
curl http://localhost:3000/api/schools
```

### 3. ตรวจสอบ Database
```bash
# เปิด Prisma Studio
npm run db:studio
# จะเปิดที่ http://localhost:5555
```

---

## 🐛 Troubleshooting

### ❌ Error: Can't reach database server
**แก้ไข:**
- ตรวจสอบว่า MySQL service ใน Laragon ทำงานอยู่
- ตรวจสอบ `DATABASE_URL` ใน `.env`

### ❌ Error: Port 3000 already in use
**แก้ไข:**
```bash
# เปลี่ยน port
npm run dev -- -p 3001
```

### ❌ Error: Module not found
**แก้ไข:**
```bash
# ติดตั้ง dependencies ใหม่
npm install
```

### ❌ Error: Prisma Client not generated
**แก้ไข:**
```bash
npm run db:generate
```

---

## 📊 สรุป Architecture

```
┌─────────────────────────────────────┐
│         Next.js Application        │
│  (Frontend + Backend รวมกัน)        │
├─────────────────────────────────────┤
│  Frontend (App Router)              │
│  - React Components                 │
│  - Pages (app/)                     │
│  - UI Components                    │
├─────────────────────────────────────┤
│  Backend (API Routes)               │
│  - API Endpoints (app/api/)         │
│  - Server Actions                   │
│  - Middleware                       │
├─────────────────────────────────────┤
│  Database Layer                     │
│  - Prisma ORM                       │
│  - MySQL Database                   │
└─────────────────────────────────────┘
```

---

## ✅ Checklist ก่อนรัน

- [ ] MySQL service ทำงานใน Laragon
- [ ] Database `nitesa` สร้างแล้ว
- [ ] ไฟล์ `.env` ตั้งค่าแล้ว
- [ ] รัน `npm install` แล้ว
- [ ] รัน `npm run db:generate` แล้ว
- [ ] รัน `npm run db:migrate` แล้ว
- [ ] Port 3000 ว่าง (หรือเปลี่ยน port)

---

## 🎉 พร้อมใช้งาน!

หลังจากรัน `npm run dev` แล้ว:
1. เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**
2. Frontend และ Backend จะทำงานพร้อมกัน
3. Hot Reload จะทำงานอัตโนมัติเมื่อแก้ไขโค้ด

---

## 📝 หมายเหตุ

- **ไม่ต้องรันแยก Frontend/Backend** เพราะ Next.js รวมไว้ด้วยกัน
- **Development mode** ใช้ `npm run dev` (Hot Reload)
- **Production mode** ใช้ `npm run build` แล้ว `npm run start`
- **Database** ต้องทำงานก่อนรัน application

