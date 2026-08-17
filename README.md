# A SQUARE Report Management System

A production-ready web application for digitizing trip sheet management, fleet operations, and business reporting. Built with **Next.js 16**, **Prisma 7**, **Vercel Postgres**, **Auth.js**, and **Vercel Blob**.

## Features

- 🚗 **Fleet Management**: Track vehicles, status, investor/dealer assignments
- 👥 **Entity CRUD**: Manage customers, dealers, investors
- 📋 **Trip Sheet Core Module**: Record trips with KM tracking, expense calculation, automatic financials
- 💰 **Ledger System**: Customer billing, dealer commissions, investor settlements, payment tracking
- 📊 **Analytics Dashboard**: Real-time metrics, vehicle utilization, recent activity
- 📈 **Business Reports**: Dealer-wise, customer-wise, vehicle-wise summaries
- 🔐 **Role-Based Access Control**: Admin, Staff, Dealer, Investor roles
- 🔒 **Secure Authentication**: Auth.js with Credentials provider
- 📁 **File Uploads**: Invoices/bills via Vercel Blob Storage

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Frontend | React 19, Tailwind CSS 4, Lucide React |
| Database | PostgreSQL (Vercel Postgres / Neon) |
| ORM | Prisma 7 with Neon Driver Adapter |
| Auth | Auth.js 5 (next-auth) with Credentials provider |
| Storage | Vercel Blob |
| Forms | React Hook Form + Zod validation |
| Hosting | Vercel (Node.js runtime) |

## Quick Start (Local)

### Prerequisites
- Node.js 20+, npm 11+

### 1. Install & Setup

```bash
npm install
cp .env.example .env
```

### 2. Database & Migrations

```bash
npm run db:push
npm run db:seed
```

### 3. Start Development

```bash
npm run dev
```

**Login:** `admin@asquare.local` / `staff@asquare.local`  
**Password:** (from `.env` `SEED_ADMIN_PASSWORD`)

Navigate to http://localhost:3000

---

## Deploy to Vercel

### 1. Create Vercel Postgres
Vercel Dashboard → **Storage → Postgres** → **Create**

### 2. Deploy
```bash
git push origin main
```

### 3. Set Environment Variables
In Vercel Dashboard → **Settings → Environment Variables**:
```
AUTH_SECRET              (npx auth secret)
NEXTAUTH_URL             https://yourdomain.vercel.app
BLOB_READ_WRITE_TOKEN    (optional, for uploads)
SEED_ADMIN_PASSWORD      YourPassword@123
```

### 4. Run Migrations
```bash
vercel env pull
npm run db:push
npm run db:seed
```

---

## Project Structure

```
asquare/
├── app/(app)/              # Protected routes
│   ├── dashboard/
│   ├── vehicles/
│   ├── customers/
│   ├── dealers/
│   ├── investors/
│   ├── trip-sheets/
│   ├── reports/
│   └── layout.tsx          # AppShell
├── app/login/
├── api/auth/[...nextauth]/
├── actions/                # Server Actions
├── components/             # React components
├── lib/                    # Utilities
├── middleware.ts           # Route protection
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Core Features

### Trip Sheet Management
- Create trips with customer, vehicle, driver, route
- Real-time KM & expense calculations
- Automatic financial summaries
- Upload attachments

### Entity Management
- Customers, Dealers, Investors, Vehicles
- Ledger tracking (billed, received, outstanding)
- Payment history & settlements

### Analytics & Reports
- Dashboard with KPIs
- Dealer-wise, customer-wise, vehicle-wise summaries
- Utilization metrics

### Security
- Role-based access control (Admin, Staff, Dealer, Investor)
- Secure authentication with JWT
- Activity logging for audit trail

---

## Environment Variables

```
DATABASE_URL              PostgreSQL connection string
AUTH_SECRET               Random secret (npx auth secret)
NEXTAUTH_URL              Deployed URL (https://yourdomain.com)
BLOB_READ_WRITE_TOKEN     Vercel Blob token (optional)
SEED_ADMIN_PASSWORD       Initial admin password
```

---

## Production Checklist

- [ ] Set strong `AUTH_SECRET`
- [ ] Configure `NEXTAUTH_URL` for production
- [ ] Test auth & role-based redirects
- [ ] Run `npm run build` to verify
- [ ] Set up database backups
- [ ] Monitor Vercel logs

---

## Documentation

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://prisma.io)
- [Auth.js Docs](https://authjs.dev)
- [Vercel Docs](https://vercel.com/docs)

---

**Built with ❤️ for A SQUARE Fleet Management**
