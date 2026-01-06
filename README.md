# ระบบนิเทศการศึกษา

ระบบ Web Application สำหรับการจัดการข้อมูลการนิเทศการศึกษาขั้นพื้นฐาน โดยรองรับการทำงานแบบ Role-Based Access Control (RBAC) สำหรับสำนักงานเขตพื้นที่การศึกษาประถมศึกษาในประเทศไทย

## เทคโนโลยีที่ใช้

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **Recharts** (สำหรับกราฟ)
- **React Hook Form** + **Zod** (สำหรับ form validation)
- **Zustand** (state management)

### Backend
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth.js v5** (Google OAuth)
- **Next.js API Routes**

## การติดตั้ง

1. Clone repository
```bash
git clone <repository-url>
cd nitesa
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า environment variables
สร้างไฟล์ `.env` จาก `.env.example` และกรอกข้อมูล:
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และกรอกข้อมูลที่จำเป็น:
- `DATABASE_URL` - URL ของฐานข้อมูล MySQL (ตัวอย่าง: `mysql://root:@localhost:3306/nitesa?schema=public`)
- `NEXTAUTH_SECRET` - Secret key สำหรับ NextAuth (ใช้ค่าจาก .env.example หรือสร้างใหม่)
- `NEXTAUTH_URL` - URL ของแอปพลิเคชัน (http://localhost:3000 สำหรับ development)
- `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` - จาก Google Cloud Console

**สำหรับการตั้งค่า Google OAuth:** ดูคำแนะนำแบบละเอียดในไฟล์ `GOOGLE_OAUTH_SETUP.md`

**หมายเหตุ:** สำหรับ Laragon MySQL:
- **User:** `root`
- **Password:** `` (ว่างเปล่า - ไม่มี password)
- ตรวจสอบว่า MySQL service ทำงานอยู่
- สร้าง database: `CREATE DATABASE nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- ใช้ `DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"`

**ดูคำแนะนำแบบละเอียด:** ดูไฟล์ `QUICK_SETUP.md`

4. ตั้งค่าฐานข้อมูล
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

5. รัน development server
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## บทบาทผู้ใช้งาน

### 1. ADMIN (ผู้ดูแลระบบเขตฯ)
- เข้าถึงข้อมูลทั้งหมดทุกโรงเรียนในเขต
- จัดการผู้ใช้งาน (เพิ่ม/ลบ/แก้ไข)
- อนุมัติ/แก้ไขผลการนิเทศทั้งหมด
- ดู Dashboard ภาพรวมทั้งเขต
- Export รายงาน (PDF/Excel)
- ตั้งค่าระบบ

### 2. SUPERVISOR (ศึกษานิเทศก์)
- สร้าง/แก้ไข/ลบผลการนิเทศของโรงเรียนที่รับผิดชอบ
- แนบไฟล์หลักฐาน
- ดู Dashboard ของโรงเรียนที่ตนรับผิดชอบ
- Export รายงาน

### 3. SCHOOL (ผู้อำนวยการ/ครู)
- ดูผลการนิเทศของโรงเรียนตนเอง
- ดูประวัติการนิเทศย้อนหลัง
- ตอบรับผลการนิเทศ (Acknowledge)
- แนบแผนพัฒนาตามข้อเสนอแนะ

### 4. EXECUTIVE (ผู้บริหารระดับสูง)
- ดู Dashboard ภาพรวมแบบ Read-only
- ดูรายงานสรุปผลทั้งเขต
- ดูแนวโน้มและการวิเคราะห์ข้อมูล

## โครงสร้างโปรเจกต์

```
nitesa/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages for each role
│   ├── api/             # API routes
│   ├── supervisions/    # Supervision pages
│   └── schools/         # School pages
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   ├── charts/          # Chart components
│   └── supervision/     # Supervision components
├── lib/
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # NextAuth config
│   ├── storage.ts       # File storage utilities
│   ├── email.ts         # Email service
│   └── alerts.ts        # Alert system
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── public/
    └── uploads/         # Uploaded files
```

## ฟีเจอร์หลัก

- ✅ Authentication ด้วย Google OAuth
- ✅ Role-based access control
- ✅ Dashboard สำหรับแต่ละ role
- ✅ CRUD สำหรับ Supervision
- ✅ ระบบอัปโหลดไฟล์
- ✅ จัดการโรงเรียนและผู้ใช้งาน
- ✅ Charts และ Analytics
- ✅ รายงาน (Export CSV)
- ✅ ระบบตอบรับผลการนิเทศ
- ตั้งค่าระบบ

## Scripts

- `npm run dev` - รัน development server
- `npm run build` - Build สำหรับ production
- `npm run start` - รัน production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - เปิด Prisma Studio

## การใช้งาน

### การเข้าสู่ระบบ
1. ไปที่ `/login`
2. คลิก "เข้าสู่ระบบด้วย Google"
3. ระบบจะ redirect ไปยัง dashboard ตาม role ของคุณ

### สร้างการนิเทศ (สำหรับ SUPERVISOR)
1. ไปที่ `/supervisions/new`
2. กรอกข้อมูลการนิเทศ
3. เพิ่มตัวชี้วัด
4. บันทึกหรือส่งให้อนุมัติ

### ดูรายงาน (สำหรับ ADMIN/EXECUTIVE)
1. ไปที่ `/reports/district`
2. ดูกราฟและสถิติ
3. คลิก "Export PDF" เพื่อดาวน์โหลดรายงาน

## License

MIT
