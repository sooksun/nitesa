# คู่มือการตั้งค่า Google OAuth Login

## ขั้นตอนการตั้งค่า Google OAuth

### 1. สร้าง Google Cloud Project และ OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
   - คลิกที่ dropdown project (ด้านบนซ้าย)
   - คลิก "New Project"
   - ตั้งชื่อ project (เช่น "Nitesa Education System")
   - คลิก "Create"

3. เปิดใช้งาน Google+ API
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google+ API" หรือ "Google Identity"
   - คลิก "Enable"

4. สร้าง OAuth 2.0 Credentials
   - ไปที่ "APIs & Services" > "Credentials"
   - คลิก "Create Credentials" > "OAuth client ID"
   - ถ้ายังไม่ได้ตั้งค่า OAuth consent screen:
     - เลือก "External" (สำหรับ testing) หรือ "Internal" (สำหรับ Google Workspace)
     - กรอกข้อมูล:
       - App name: "ระบบนิเทศการศึกษา"
       - User support email: อีเมลของคุณ
       - Developer contact: อีเมลของคุณ
     - คลิก "Save and Continue"
     - ข้าม Scopes (ไม่ต้องเพิ่ม)
     - เพิ่ม Test users (อีเมลที่ต้องการให้ทดสอบ)
     - คลิก "Save and Continue"
     - Review และ "Back to Dashboard"

5. สร้าง OAuth Client ID
   - Application type: เลือก "Web application"
   - Name: ตั้งชื่อ (เช่น "Nitesa Web Client")
   - Authorized JavaScript origins:
     - สำหรับ development: `http://localhost:3000`
     - สำหรับ production: `https://yourdomain.com`
   - Authorized redirect URIs:
     - สำหรับ development: `http://localhost:3000/api/auth/callback/google`
     - สำหรับ production: `https://yourdomain.com/api/auth/callback/google`
   - คลิก "Create"

6. คัดลอก Client ID และ Client Secret
   - หลังจากสร้างเสร็จ จะแสดง Client ID และ Client Secret
   - **สำคัญ:** เก็บ Client Secret ไว้เป็นความลับ

### 2. ตั้งค่า Environment Variables

1. สร้างไฟล์ `.env` ใน root directory ของโปรเจกต์ (ถ้ายังไม่มี)

2. เพิ่ม environment variables ต่อไปนี้:

```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. สร้าง NEXTAUTH_SECRET

รันคำสั่งนี้เพื่อสร้าง secret key:

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# หรือใช้ Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# หรือใช้ online tool: https://generate-secret.vercel.app/32
```

### 4. ตัวอย่างไฟล์ .env

```env
# Database Configuration
DATABASE_URL="mysql://root:@localhost:3306/nitesa?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

### 5. Restart Development Server

หลังจากตั้งค่า `.env` แล้ว:

```bash
# หยุด server (Ctrl+C) แล้วรันใหม่
npm run dev
```

### 6. ทดสอบ Google Login

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Google"
3. เลือกบัญชี Google ที่ต้องการ
4. อนุญาตการเข้าถึง
5. ระบบจะ redirect กลับมาที่ dashboard

## หมายเหตุสำคัญ

### สำหรับ Development (localhost)
- ใช้ `http://localhost:3000` ใน Authorized JavaScript origins
- ใช้ `http://localhost:3000/api/auth/callback/google` ใน Authorized redirect URIs

### สำหรับ Production
- เปลี่ยน `NEXTAUTH_URL` เป็น URL ของ production
- เพิ่ม production URL ใน Google Cloud Console
- ใช้ HTTPS เสมอ

### Security Tips
- **อย่า commit ไฟล์ `.env` ลง Git**
- ตรวจสอบว่า `.env` อยู่ใน `.gitignore`
- ใช้ environment variables ที่แตกต่างกันสำหรับ development และ production
- หมั่นตรวจสอบ OAuth credentials ใน Google Cloud Console

## แก้ไขปัญหา

### Error: "Missing required parameter: client_id"
- ตรวจสอบว่า `GOOGLE_CLIENT_ID` ถูกตั้งค่าใน `.env`
- ตรวจสอบว่า restart server แล้ว
- ตรวจสอบว่าไม่มี space หรือ quote ผิดพลาดใน `.env`

### Error: "redirect_uri_mismatch"
- ตรวจสอบว่า redirect URI ใน Google Cloud Console ตรงกับ `NEXTAUTH_URL/api/auth/callback/google`
- ตรวจสอบว่าใช้ `http://` หรือ `https://` ถูกต้อง

### Error: "access_denied"
- ตรวจสอบว่า OAuth consent screen ตั้งค่าถูกต้อง
- ตรวจสอบว่า email ที่ใช้ login อยู่ใน Test users (ถ้ายังอยู่ใน Testing mode)

## เอกสารเพิ่มเติม

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

