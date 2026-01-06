# แก้ไขปัญหาการเข้าสู่ระบบ

## ปัญหาที่พบบ่อย

### 1. Error: MissingSecret

**สาเหตุ:** ไม่มี `NEXTAUTH_SECRET` ในไฟล์ `.env`

**วิธีแก้:**
1. สร้างไฟล์ `.env` ใน root directory
2. เพิ่มบรรทัดนี้:
```env
NEXTAUTH_SECRET="Ub1osSBMdYcPm+laAZUPO1HveAS17caGqVediHOjD5M="
NEXTAUTH_URL="http://localhost:3000"
```

### 2. เข้าระบบไม่ได้ด้วย Email/Password

**สาเหตุ:** 
- ยังไม่ได้รัน migration เพื่อเพิ่ม password field
- ยังไม่ได้ seed database
- User ยังไม่มี password

**วิธีแก้:**

1. **รัน Migration:**
```bash
npm run db:migrate
```

2. **Seed Database:**
```bash
npm run db:seed
```

3. **ตรวจสอบว่า User มี password:**
- เปิด Prisma Studio: `npm run db:studio`
- ตรวจสอบตาราง User ว่ามี password field หรือไม่

### 3. Test Accounts (จาก seed data)

หลังจากรัน seed แล้ว สามารถใช้บัญชีเหล่านี้:

- **Admin:** 
  - Email: `admin@nitesa.local`
  - Password: `password123`

- **Supervisor 1:**
  - Email: `supervisor1@nitesa.local`
  - Password: `password123`

- **Supervisor 2:**
  - Email: `supervisor2@nitesa.local`
  - Password: `password123`

- **Executive:**
  - Email: `executive@nitesa.local`
  - Password: `password123`

### 4. Database Connection Error

**สาเหตุ:** Database server ไม่ได้รัน หรือ DATABASE_URL ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่า PostgreSQL server รันอยู่
2. ตรวจสอบ DATABASE_URL ในไฟล์ `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nitesa?schema=public"
```

### 5. Google OAuth ไม่ทำงาน

**สาเหตุ:** ไม่มี GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET

**วิธีแก้:**
1. สร้าง Google OAuth credentials ที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เพิ่มในไฟล์ `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 6. Debug Login Issues

เปิด Browser Console และดู error messages:
- ตรวจสอบ Network tab ใน DevTools
- ดู Console logs สำหรับ error messages

### 7. Reset Password

หากต้องการ reset password ของ user:

```typescript
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash('newpassword', 10)
await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { password: hashedPassword }
})
```

## ขั้นตอนการ Setup ใหม่

1. สร้างไฟล์ `.env`:
```bash
cp .env.example .env
```

2. แก้ไข `.env` และเพิ่ม:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nitesa"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

3. Generate Prisma Client:
```bash
npm run db:generate
```

4. Run Migration:
```bash
npm run db:migrate
```

5. Seed Database:
```bash
npm run db:seed
```

6. Start Development Server:
```bash
npm run dev
```

## ตรวจสอบสถานะ

1. ตรวจสอบว่า Prisma Client ถูก generate แล้ว:
```bash
ls node_modules/.prisma/client
```

2. ตรวจสอบว่า database มี tables:
```bash
npm run db:studio
```

3. ตรวจสอบ logs ใน terminal เมื่อรัน `npm run dev`

