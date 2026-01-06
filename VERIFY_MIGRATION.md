# ตรวจสอบ Migration Status

## สถานะปัจจุบัน

✅ **Migration ถูก apply แล้ว:**
- Migration: `20251115030633_add_policy_fields_and_network_group`
- Error "Duplicate column name 'networkGroup'" แสดงว่า column นี้มีอยู่แล้วใน database

✅ **Fields ที่ถูกเพิ่ม:**
- `school.networkGroup` - กลุ่มเครือข่าย
- `supervision.academicYear` - ปีการศึกษา
- `supervision.ministerPolicy` - นโยบายรัฐมนตรี
- `supervision.obecPolicy` - นโยบายสพฐ
- `supervision.areaPolicy` - นโยบายเขตพื้นที่การศึกษา

## ขั้นตอนแก้ไข

### 1. Regenerate Prisma Client

```bash
npm run db:generate
```

### 2. Restart Dev Server

```bash
# หยุด server (Ctrl+C)
npm run dev
```

### 3. ตรวจสอบใน phpMyAdmin หรือ MySQL Client

ตรวจสอบว่า columns ถูกเพิ่มแล้ว:

```sql
-- ตรวจสอบตาราง school
DESCRIBE school;
-- ควรเห็น column: networkGroup

-- ตรวจสอบตาราง supervision
DESCRIBE supervision;
-- ควรเห็น columns: academicYear, ministerPolicy, obecPolicy, areaPolicy
```

### 4. ทดสอบการบันทึก

1. เปิด `http://localhost:3000/supervisions/new`
2. กรอกข้อมูลทั้งหมด
3. คลิก "บันทึก"

## ถ้ายังมีปัญหา

ตรวจสอบว่า Prisma Client รู้จัก fields ใหม่หรือไม่:

```typescript
// ตรวจสอบใน code
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ควรจะไม่มี error เมื่อใช้
prisma.school.create({
  data: {
    networkGroup: 'test' // ควรจะไม่มี error
  }
})
```

