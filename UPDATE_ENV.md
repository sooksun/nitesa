# อัปเดตไฟล์ .env สำหรับ MySQL

## การตั้งค่า

เปิดไฟล์ `.env` ใน root directory และอัปเดต `DATABASE_URL` เป็น:

```env
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"
```

## รายละเอียด

- **User:** `root`
- **Password:** `` (ว่างเปล่า)
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `nitesa`

## ตัวอย่างไฟล์ .env ที่สมบูรณ์

```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"

# NextAuth
NEXTAUTH_SECRET="Ub1osSBMdYcPm+laAZUPO1HveAS17caGqVediHOjD5M="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Optional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
```

## หลังจากอัปเดต .env

รันคำสั่งต่อไปนี้:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## ตรวจสอบการเชื่อมต่อ

```bash
npm run db:studio
```

หรือทดสอบใน code:

```typescript
import { prisma } from '@/lib/db'

// Test connection
try {
  await prisma.$connect()
  console.log('✓ Connected to MySQL successfully!')
} catch (error) {
  console.error('✗ Connection failed:', error)
}
```

