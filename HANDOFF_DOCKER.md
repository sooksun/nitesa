# 🐳 Handoff Document: Docker Deployment Guide

## 📋 ข้อมูลโปรเจกต์

- **Application Name:** ระบบนิเทศการศึกษา (Nitesa)
- **Technology Stack:** Next.js 15, TypeScript, Prisma ORM, MySQL 8.0
- **Host:** Ubuntu 24
- **URL:** http://203.172.184.47:3000
- **Port:** 3000

---

## 🎯 ภาพรวม

เอกสารนี้เป็นคู่มือสำหรับการ deploy application ไปยัง Ubuntu 24 server โดยใช้ Docker และ Docker Compose

### สิ่งที่ต้องเตรียม

1. **Server Requirements:**
   - Ubuntu 24.04 LTS
   - Docker Engine 24.0+
   - Docker Compose 2.20+
   - อย่างน้อย 2GB RAM
   - อย่างน้อย 10GB disk space

2. **Network:**
   - Port 3000 เปิดสำหรับ application
   - Port 3306 เปิดสำหรับ MySQL (optional, ถ้าต้องการเข้าถึงจากภายนอก)

---

## 📦 ขั้นตอนการ Deploy

### 1. ติดตั้ง Docker และ Docker Compose

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version

# Add current user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

### 2. Clone หรือ Upload โปรเจกต์

```bash
# Option 1: Clone from Git (ถ้ามี repository)
git clone <repository-url>
cd nitesa

# Option 2: Upload files via SCP
# จากเครื่อง local:
# scp -r /path/to/nitesa user@203.172.184.47:/home/user/
```

### 3. สร้างไฟล์ Environment Variables

สร้างไฟล์ `.env` ใน root directory ของโปรเจกต์:

```bash
cd /path/to/nitesa
nano .env
```

เพิ่มเนื้อหาดังนี้:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=nitesa_root_password_change_me
MYSQL_DATABASE=nitesa
MYSQL_USER=nitesa_user
MYSQL_PASSWORD=nitesa_password_change_me

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long-generate-new-one
NEXTAUTH_URL=http://203.172.184.47:3000

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

**⚠️ สำคัญ:** 
- เปลี่ยน `MYSQL_ROOT_PASSWORD` และ `MYSQL_PASSWORD` เป็นรหัสผ่านที่แข็งแรง
- สร้าง `NEXTAUTH_SECRET` ใหม่ด้วยคำสั่ง:
  ```bash
  openssl rand -base64 32
  ```
- อัปเดต `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` ถ้ามี
- อัปเดต `NEXTAUTH_URL` ให้ตรงกับ production URL

### 4. สร้างโฟลเดอร์สำหรับ Uploads

```bash
mkdir -p uploads public/uploads
chmod -R 755 uploads public/uploads
```

### 5. Build และ Run Docker Containers

**วิธีที่ 1: ใช้ Deploy Script (แนะนำ)**

```bash
# ให้สิทธิ์ execute
chmod +x deploy.sh

# รัน deploy script
./deploy.sh
```

**วิธีที่ 2: Manual**

```bash
# Build images
docker compose build

# Start containers
docker compose up -d

# ตรวจสอบ logs
docker compose logs -f app
```

### 6. รัน Database Migrations

```bash
# รัน migrations (ถ้ายังไม่ได้รันใน docker-compose)
docker compose exec app npx prisma migrate deploy

# Seed database (optional - สำหรับข้อมูลตัวอย่าง)
docker compose exec app npm run db:seed
```

### 7. ตรวจสอบสถานะ

```bash
# ตรวจสอบ containers
docker compose ps

# ตรวจสอบ logs
docker compose logs app
docker compose logs mysql

# ตรวจสอบว่า application ทำงาน
curl http://localhost:3000
```

---

## 🔧 การจัดการ

### ดู Logs

```bash
# Logs ทั้งหมด
docker compose logs

# Logs ของ app
docker compose logs app

# Logs แบบ real-time
docker compose logs -f app

# Logs ล่าสุด 100 บรรทัด
docker compose logs --tail=100 app
```

### Restart Services

```bash
# Restart ทั้งหมด
docker compose restart

# Restart เฉพาะ app
docker compose restart app

# Restart เฉพาะ MySQL
docker compose restart mysql
```

### Stop และ Start

```bash
# Stop
docker compose stop

# Start
docker compose start

# Stop และลบ containers
docker compose down

# Stop และลบ containers + volumes (⚠️ จะลบข้อมูลใน database)
docker compose down -v
```

### Update Application

```bash
# Pull code ใหม่ (ถ้าใช้ Git)
git pull

# Rebuild และ restart
docker compose build --no-cache app
docker compose up -d app

# รัน migrations (ถ้ามี)
docker compose exec app npx prisma migrate deploy
```

### Backup Database

**วิธีที่ 1: ใช้ Backup Script (แนะนำ)**

```bash
# ให้สิทธิ์ execute
chmod +x backup-db.sh

# รัน backup script
./backup-db.sh
```

**วิธีที่ 2: Manual**

```bash
# Backup
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nitesa > backup_$(date +%Y%m%d_%H%M%S).sql

# หรือใช้ docker exec
docker exec nitesa-mysql mysqldump -u root -pnitesa_root_password_change_me nitesa > backup.sql
```

### Restore Database

```bash
# Restore
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} nitesa < backup.sql
```

---

## 🌐 Network Configuration

### ตั้งค่า Reverse Proxy (Nginx - Optional)

ถ้าต้องการใช้ Nginx เป็น reverse proxy:

```nginx
# /etc/nginx/sites-available/nitesa
server {
    listen 80;
    server_name 203.172.184.47;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/nitesa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### ตั้งค่า Firewall

```bash
# เปิด port 3000
sudo ufw allow 3000/tcp

# เปิด port 3306 (ถ้าต้องการเข้าถึง MySQL จากภายนอก - ไม่แนะนำ)
# sudo ufw allow 3306/tcp

# ตรวจสอบ firewall status
sudo ufw status
```

---

## 🔍 Troubleshooting

### Application ไม่ทำงาน

```bash
# ตรวจสอบ logs
docker compose logs app

# ตรวจสอบว่า container ทำงาน
docker compose ps

# Restart container
docker compose restart app
```

### Database Connection Error

```bash
# ตรวจสอบว่า MySQL container ทำงาน
docker compose ps mysql

# ตรวจสอบ MySQL logs
docker compose logs mysql

# ทดสอบเชื่อมต่อ MySQL
docker compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SHOW DATABASES;"
```

### Port 3000 ถูกใช้งานแล้ว

```bash
# ตรวจสอบ process ที่ใช้ port 3000
sudo lsof -i :3000
# หรือ
sudo netstat -tulpn | grep 3000

# หยุด process หรือเปลี่ยน port ใน docker-compose.yml
```

### Permission Issues

```bash
# ตรวจสอบ permissions ของ uploads folder
ls -la uploads/
chmod -R 755 uploads public/uploads
chown -R $USER:$USER uploads public/uploads
```

### Prisma Client ไม่ถูก Generate

```bash
# Generate Prisma Client
docker compose exec app npx prisma generate

# หรือ rebuild container
docker compose build --no-cache app
docker compose up -d app
```

---

## 📊 Monitoring

### ตรวจสอบ Resource Usage

```bash
# ดู resource usage ของ containers
docker stats

# ดู disk usage
docker system df
```

### Health Checks

```bash
# ตรวจสอบ health ของ MySQL
docker compose exec mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD}

# ตรวจสอบ health ของ app
curl http://localhost:3000/api/health
```

---

## 🔐 Security Best Practices

1. **เปลี่ยนรหัสผ่าน default:**
   - เปลี่ยน `MYSQL_ROOT_PASSWORD` และ `MYSQL_PASSWORD` ใน `.env`

2. **ใช้ HTTPS:**
   - ตั้งค่า SSL certificate (Let's Encrypt)
   - ใช้ Nginx reverse proxy

3. **Firewall:**
   - เปิดเฉพาะ port ที่จำเป็น
   - ปิด port 3306 จากภายนอก

4. **Backup:**
   - ตั้งค่า automated backup สำหรับ database
   - เก็บ backup ไว้ในที่ปลอดภัย

5. **Environment Variables:**
   - อย่า commit `.env` ลง Git
   - ใช้ secrets management สำหรับ production

---

## 📝 Checklist ก่อน Deploy

- [ ] ติดตั้ง Docker และ Docker Compose
- [ ] Clone/Upload โปรเจกต์
- [ ] สร้างไฟล์ `.env` และตั้งค่าทั้งหมด
- [ ] สร้างโฟลเดอร์ `uploads` และ `public/uploads`
- [ ] Build Docker images
- [ ] Start containers
- [ ] รัน database migrations
- [ ] ตรวจสอบ logs
- [ ] ทดสอบ application ที่ http://203.172.184.47:3000
- [ ] ตั้งค่า firewall
- [ ] ตั้งค่า backup (optional)
- [ ] ตั้งค่า monitoring (optional)

---

## 📞 Support

ถ้ามีปัญหาหรือคำถาม:
1. ตรวจสอบ logs: `docker compose logs -f`
2. ตรวจสอบ documentation ในโปรเจกต์
3. ตรวจสอบ GitHub issues (ถ้ามี)

---

## 🔄 Update Process

เมื่อต้องการอัปเดต application:

```bash
# 1. Pull code ใหม่
git pull

# 2. Backup database
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nitesa > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Rebuild application
docker compose build --no-cache app

# 4. Stop และ start ใหม่
docker compose up -d app

# 5. รัน migrations (ถ้ามี)
docker compose exec app npx prisma migrate deploy

# 6. ตรวจสอบ logs
docker compose logs -f app
```

---

**หมายเหตุ:** เอกสารนี้เป็นคู่มือพื้นฐานสำหรับการ deploy ด้วย Docker บน Ubuntu 24 อาจต้องปรับแต่งเพิ่มเติมตามความต้องการของแต่ละ environment
