# 🚀 Docker Quick Start Guide

คู่มือเริ่มต้นใช้งาน Docker สำหรับ Nitesa Application

## ⚡ Quick Start

### 1. เตรียมไฟล์ `.env`

```bash
# Copy template
cp .env.example .env

# แก้ไข .env และตั้งค่าทั้งหมด
nano .env
```

**ต้องตั้งค่า:**
- `MYSQL_ROOT_PASSWORD` - รหัสผ่าน root ของ MySQL
- `MYSQL_PASSWORD` - รหัสผ่าน user ของ MySQL
- `NEXTAUTH_SECRET` - สร้างด้วย: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://203.172.184.47:3000`

### 2. Deploy

```bash
# ให้สิทธิ์ execute
chmod +x deploy.sh

# รัน deploy
./deploy.sh
```

### 3. ตรวจสอบ

```bash
# ดู logs
docker compose logs -f app

# ตรวจสอบ status
docker compose ps

# ทดสอบ
curl http://localhost:3000
```

## 📋 คำสั่งที่ใช้บ่อย

```bash
# ดู logs
docker compose logs -f app

# Restart
docker compose restart app

# Stop
docker compose stop

# Start
docker compose start

# Backup database
./backup-db.sh

# Update application
git pull
docker compose build --no-cache app
docker compose up -d app
```

## 🔧 Troubleshooting

### Application ไม่ทำงาน
```bash
docker compose logs app
docker compose restart app
```

### Database connection error
```bash
docker compose logs mysql
docker compose restart mysql
```

### Port ถูกใช้งานแล้ว
```bash
sudo lsof -i :3000
# หรือเปลี่ยน port ใน docker-compose.yml
```

## 📚 ดูเอกสารเพิ่มเติม

- `HANDOFF_DOCKER.md` - คู่มือแบบละเอียด
- `README.md` - ข้อมูลโปรเจกต์
