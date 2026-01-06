# ตั้งค่า MySQL Database สำหรับ Laragon

## ขั้นตอนการตั้งค่า

### 1. ตรวจสอบว่า MySQL ทำงานอยู่

เปิด Laragon และตรวจสอบว่า MySQL service ทำงานอยู่ (ควรเป็นสีเขียว)

### 2. สร้าง Database

เปิด MySQL Command Line หรือใช้ phpMyAdmin (http://localhost/phpmyadmin) และรันคำสั่ง:

```sql
CREATE DATABASE IF NOT EXISTS nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

หรือใช้คำสั่งใน Command Prompt:
```bash
D:\laragon\data\mysql-8\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. อัปเดตไฟล์ .env

เปิดไฟล์ `.env` ใน root directory และอัปเดต `DATABASE_URL`:

```env
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"
```

**รายละเอียด:**
- `root` = username
- `@` = password (ว่างเปล่า - ไม่มี password)
- `localhost:3306` = host และ port (default ของ Laragon)
- `nitesa` = ชื่อ database

**หมายเหตุ:** สำหรับ Laragon MySQL โดยทั่วไปจะไม่มี password สำหรับ root user

### 4. รัน Migration

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

## ตรวจสอบการเชื่อมต่อ

รันคำสั่งเพื่อตรวจสอบ:

```bash
npm run db:studio
```

หรือทดสอบใน code:

```typescript
import { prisma } from '@/lib/db'

// Test connection
await prisma.$connect()
console.log('Connected to MySQL!')
```

## Troubleshooting

### Error: Can't reach database server
- ตรวจสอบว่า MySQL service ทำงานอยู่
- ตรวจสอบ port 3306 ไม่ถูกใช้งานโดยโปรแกรมอื่น
- ตรวจสอบ username/password ใน .env

### Error: Access denied
- ตรวจสอบ username และ password ใน .env
- ลองใช้ root user ที่ไม่มี password

### Error: Unknown database
- สร้าง database ก่อนด้วยคำสั่ง CREATE DATABASE

