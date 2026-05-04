# Mahoraga - ระบบดูดวงออนไลน์

ระบบดูดวงออนไลน์ที่ใช้ AI (Llama 3.3 ผ่าน Groq API) ในการทำนายดวงชะตา พร้อมร้านค้าออนไลน์สำหรับสินค้ามงคล

## Features

### สำหรับผู้ใช้ทั่วไป
- **ดูดวงด้วย AI** - ระบบทำนายดวงชะตาอัตโนมัติโดยใช้ Llama 3.3 ผ่าน Groq API
- **ประวัติการดูดวง** - บันทึกและดูประวัติการดูดวงย้อนหลัง
- **ร้านค้าออนไลน์** - ซื้อสินค้ามงคล พระเครื่อง หินนำโชค
- **ระบบสมาชิก** - ลงทะเบียนและเข้าสู่ระบบเพื่อบันทึกข้อมูล

### สำหรับผู้ดูแลระบบ (Admin)
- **Dashboard** - สถิติและภาพรวมระบบ
- **จัดการผู้ใช้** - ดูรายชื่อผู้ใช้ แบน/ปลดแบน เปลี่ยนสิทธิ์
- **จัดการสินค้า** - เพิ่ม แก้ไข ปิดการใช้งานสินค้า
- **Monitoring** - ตรวจสอบสุขภาพระบบ และดู request/error logs
- **Backup & Restore** - สำรองและกู้คืนฐานข้อมูล
- **Scheduled Backup** - ตั้งเวลาสำรองข้อมูลอัตโนมัติ

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **AI:** Groq API (Llama 3.3)

## การติดตั้ง

### 1. Clone repository
```bash
git clone <repository-url>
cd AstroVerse
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` จาก `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Groq API (สำหรับ AI)
GROQ_API_KEY="your-groq-api-key"
```

### 4. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema ไปยัง database
npx prisma db push

# Seed ข้อมูลเริ่มต้น (admin user, sample products)
npm run db:seed
```

### 5. รัน Development Server
```bash
npm run dev
```

เปิด browser ที่ `http://localhost:3000`

## ข้อมูลเริ่มต้น (จาก Seed)

- **Admin:** admin@mahoraga.com / admin123
- **User:** user@example.com / user123

## Scripts ที่ใช้บ่อย

| Command | Description |
|---------|-------------|
| `npm run dev` | รัน dev server |
| `npm run build` | Build production |
| `npm run start` | รัน production server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ไป database |
| `npm run db:seed` | Seed ข้อมูลเริ่มต้น |

## Project Structure

```
app/
├── (auth)/          # หน้า login, register
├── (dashboard)/     # หน้า admin dashboard
├── (public)/        # หน้าสาธารณะ (home, reading, shop, etc.)
├── api/             # API routes
components/          # Reusable UI components
lib/                 # Utilities, auth, prisma client
prisma/              # Database schema
├── schema.prisma
└── seed.ts
backups/             # Backup files (ไม่ถูก commit)
```

## หมายเหตุ

- Backup files จะถูกเก็บใน `/backups/` (ถูก ignore โดย git)
- ระบบใช้ Groq API สำหรับ AI ซึ่งมี rate limit ให้ใช้อย่างระวัง
- รองรับทั้ง Light Mode และ Dark Mode
