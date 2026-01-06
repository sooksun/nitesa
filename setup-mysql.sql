-- สคริปต์สำหรับสร้าง database ใน MySQL
-- รันคำสั่งนี้ใน MySQL Command Line หรือ phpMyAdmin

CREATE DATABASE IF NOT EXISTS nitesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตรวจสอบว่า database ถูกสร้างแล้ว
SHOW DATABASES LIKE 'nitesa';

