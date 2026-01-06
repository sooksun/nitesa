# แก้ไขปัญหา Migration และ Fields ใหม่

## สถานะปัจจุบัน

✅ Migration ถูกสร้างและ apply แล้ว:
- `20251115030633_add_policy_fields_and_network_group`
- เพิ่ม fields: `academicYear`, `ministerPolicy`, `obecPolicy`, `areaPolicy` ในตาราง `supervision`
- เพิ่ม field: `networkGroup` ในตาราง `school`

✅ API Routes อัปเดตแล้ว:
- `app/api/supervisions/route.ts` - รับและบันทึก fields ใหม่
- `app/api/supervisions/[id]/route.ts` - รับและอัปเดต fields ใหม่
- `app/api/schools/route.ts` - รับและบันทึก `networkGroup`
- `app/api/schools/[id]/route.ts` - รับและอัปเดต `networkGroup`

✅ Forms อัปเดตแล้ว:
- `create-supervision-form.tsx` - มี fields สำหรับปีการศึกษาและนโยบาย
- `edit-supervision-form.tsx` - มี fields สำหรับปีการศึกษาและนโยบาย
- `create-school-form.tsx` - มี field สำหรับกลุ่มเครือข่าย
- `edit-school-form.tsx` - มี field สำหรับกลุ่มเครือข่าย

## ขั้นตอนแก้ไข

### 1. Regenerate Prisma Client

ถ้า Prisma Client ยังไม่ได้ regenerate (เกิด error EPERM):

```bash
# หยุด dev server ก่อน (Ctrl+C)
# แล้วรัน:
npm run db:generate

# หรือ
npx prisma generate
```

### 2. Restart Dev Server

หลังจาก regenerate Prisma Client แล้ว:

```bash
npm run dev
```

### 3. ทดสอบการบันทึก

1. เปิด `http://localhost:3000/supervisions/new`
2. กรอกข้อมูล:
   - เลือกโรงเรียน
   - เลือกประเภทการนิเทศ
   - เลือกวันที่
   - **กรอกปีการศึกษา** (เช่น 2567)
   - **กรอกนโยบายรัฐมนตรี** (ถ้ามี)
   - **กรอกนโยบายสพฐ** (ถ้ามี)
   - **กรอกนโยบายเขตพื้นที่การศึกษา** (ถ้ามี)
   - กรอกสรุปผลการนิเทศ
   - กรอกข้อเสนอแนะ
   - เพิ่มตัวชี้วัด
3. คลิก "บันทึก"

## ตรวจสอบ Database

ตรวจสอบว่า fields ถูกเพิ่มใน database แล้ว:

```sql
-- ตรวจสอบตาราง supervision
DESCRIBE supervision;

-- ควรเห็น columns:
-- academicYear
-- ministerPolicy
-- obecPolicy
-- areaPolicy

-- ตรวจสอบตาราง school
DESCRIBE school;

-- ควรเห็น column:
-- networkGroup
```

## แก้ไขปัญหาเพิ่มเติม

### ถ้ายังเกิด error ในการบันทึก:

1. ตรวจสอบ console ใน browser (F12) เพื่อดู error message
2. ตรวจสอบ server logs ใน terminal
3. ตรวจสอบว่า Prisma Client ถูก regenerate แล้ว
4. Restart dev server

### ถ้า migration ไม่ถูก apply:

```bash
# ตรวจสอบ migration status
npx prisma migrate status

# ถ้ายังมี pending migrations
npx prisma migrate deploy
```

