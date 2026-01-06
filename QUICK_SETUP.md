# คู่มือตั้งค่า MySQL อย่างรวดเร็ว

## การตั้งค่า MySQL สำหรับ Laragon

### ข้อมูลการเชื่อมต่อ
- **User:** `root`
- **Password:** `` (ว่างเปล่า - ไม่มี password)
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `nitesa`

---

## ขั้นตอนที่ 1: สร้าง Database

### วิธีที่ 1: ใช้ phpMyAdmin (แนะนำ)
1. เปิด Laragon
2. คลิก "Database" หรือไปที่ http://localhost/phpmyadmin
3. คลิกแท็บ "SQL"
4. วางคำสั่งนี้:
```sql
CREATE DATABASE IF NOT EXISTS nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
5. คลิก "Go" หรือกด Ctrl+Enter

### วิธีที่ 2: ใช้ Laragon Terminal
1. เปิด Laragon
2. คลิก "Terminal" → "MySQL"
3. รันคำสั่ง:
```sql
CREATE DATABASE IF NOT EXISTS nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### วิธีที่ 3: ใช้ไฟล์ SQL
1. เปิดไฟล์ `setup-mysql.sql` ในโปรเจกต์
2. Copy คำสั่ง SQL
3. รันใน MySQL Command Line หรือ phpMyAdmin

---

## ขั้นตอนที่ 2: อัปเดตไฟล์ .env

เปิดไฟล์ `.env` ใน root directory และตั้งค่า:

```env
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"
```

**สำคัญ:** 
- ใช้ `root:@` (ไม่มี password)
- Port คือ `3306` (default ของ Laragon)
- Database name คือ `nitesa`

---

## ขั้นตอนที่ 3: รัน Migration

เปิด Terminal ในโปรเจกต์และรัน:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (สร้าง tables)
npm run db:migrate

# Seed data (ข้อมูลตัวอย่าง - optional)
npm run db:seed
```

---

## ตรวจสอบการตั้งค่า

### วิธีที่ 1: ใช้ Prisma Studio
```bash
npm run db:studio
```
จะเปิด browser ที่ http://localhost:5555

### วิธีที่ 2: ตรวจสอบใน phpMyAdmin
1. ไปที่ http://localhost/phpmyadmin
2. เลือก database `nitesa`
3. ควรเห็น tables ต่างๆ ที่ถูกสร้างจาก migration

---

## Troubleshooting

### ❌ Error: Can't reach database server
**แก้ไข:**
- ตรวจสอบว่า MySQL service ใน Laragon ทำงานอยู่ (สีเขียว)
- ตรวจสอบว่า port 3306 ไม่ถูก block

### ❌ Error: Access denied for user 'root'@'localhost'
**แก้ไข:**
- ตรวจสอบว่า `.env` ใช้ `root:@` (ไม่มี password)
- ลองใช้ `root` user ที่ไม่มี password

### ❌ Error: Unknown database 'nitesa'
**แก้ไข:**
- สร้าง database ก่อนด้วยคำสั่ง CREATE DATABASE
- ตรวจสอบว่า database name ใน `.env` ตรงกับที่สร้าง

### ❌ Error: The URL must start with the protocol `mysql://`
**แก้ไข:**
- ตรวจสอบว่า `DATABASE_URL` ใน `.env` เริ่มต้นด้วย `mysql://`
- ตรวจสอบว่าไม่มี space หรืออักขระพิเศษ

---

## ตัวอย่างไฟล์ .env ที่สมบูรณ์

```env
# Database - MySQL (Laragon)
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

---

## ✅ Checklist

- [ ] MySQL service ทำงานใน Laragon
- [ ] สร้าง database `nitesa` แล้ว
- [ ] อัปเดต `DATABASE_URL` ใน `.env` แล้ว
- [ ] รัน `npm run db:generate` แล้ว
- [ ] รัน `npm run db:migrate` แล้ว
- [ ] ตรวจสอบ tables ใน Prisma Studio หรือ phpMyAdmin

---

## หลังจากตั้งค่าเสร็จ

รัน development server:
```bash
npm run dev
```

เปิด browser ไปที่: http://localhost:3000

