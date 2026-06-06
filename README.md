# Employee Reporting System

An internal web application for managing employee monthly reports, targets, and performance tracking. Built for Constromat.

## Tech Stack

**Backend** — Node.js, Express 5, Prisma ORM, MySQL  
**Frontend** — React 18, TypeScript, Vite  
**Auth** — JWT (httpOnly cookies, access + refresh token rotation)

---

## Features

- **Admin**
  - Dashboard with KPI summary and target achievement charts
  - View, filter, and paginate all employee reports
  - Download individual or all reports as PDF
  - Add and delete employee accounts
  - Create and track targets per employee
  - Mark reports as Pending or Reviewed

- **Employee**
  - Submit monthly reports with structured fields
  - Auto-save draft while filling the form
  - View personal report history and status
  - Dashboard with personal KPI cards and notifications

- **Shared**
  - Role-based routing (Admin / Employee)
  - Light / dark theme toggle
  - Login rate limiting (5 attempts / 15 min)
  - Token auto-refresh on expiry

---

## Project Structure

```
├── src/                        # Express backend
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, admin guard, rate limiter
│   ├── routes/                 # auth, reports, admin
│   ├── prisma/                 # Prisma singleton client
│   └── server.js               # App entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.js                 # Roles, statuses, admin user
├── client/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── admin/          # Admin pages and components
│   │   │   ├── employee/       # Employee pages and components
│   │   │   └── shared/         # Login, logout, icons, settings
│   │   ├── lib/                # apiFetch, auth, toast, download, utils
│   │   ├── types/              # Shared TypeScript interfaces
│   │   └── config.ts           # API base URL
│   └── routes/                 # App router and role-protected routes
└── package.json                # Root scripts (runs both server and client)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL running locally

### 1. Install dependencies

```bash
npm install
cd client && npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:<password>@localhost:3306/employee_reporting_system"
JWT_SECRET="<strong-random-secret>"
JWT_REFRESH_SECRET="<strong-random-secret>"
PORT=5000
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong-password>
```

Generate strong secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Run in development

```bash
npm run dev
```

Starts both backend (port 5000) and frontend (port 5173) concurrently.

---

## API Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new employee |
| POST | `/api/auth/login` | Public | Login (sets httpOnly cookies) |
| POST | `/api/auth/refresh` | Public | Rotate access token |
| POST | `/api/auth/logout` | Public | Clear session cookies |
| GET | `/api/auth/profile` | Auth | Get current user profile |
| GET | `/api/auth/employees` | Admin | List all employees |
| DELETE | `/api/auth/employees/:id` | Admin | Delete an employee |
| POST | `/api/reports/create` | Auth | Submit a monthly report |
| GET | `/api/reports/my-reports` | Auth | Get own reports |
| GET | `/api/admin/reports` | Admin | Get all reports (paginated) |
| GET | `/api/admin/reports/:id` | Admin | Get report by ID |
| GET | `/api/admin/reports/:id/download` | Admin | Download report as PDF |
| GET | `/api/admin/reports/download/all` | Admin | Download all reports as PDF |
| GET | `/api/admin/targets` | Admin | List all targets |
| POST | `/api/admin/targets` | Admin | Create a target |
| GET | `/api/admin/dashboard/summary` | Admin | KPI summary counts |
| GET | `/api/admin/dashboard/target-achievements` | Admin | Target vs achieved data |

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT access tokens expire in 15 minutes; refresh tokens in 7 days
- Refresh tokens are rotated on every use and stored in the database
- All cookies are `httpOnly`, `sameSite: strict`; `secure` in production
- API responses never include password hashes (explicit field selection on all Prisma queries)
- Login endpoint rate-limited to 5 requests per 15 minutes
- Request body size capped at 10kb
- CORS restricted to configured `FRONTEND_URL` in production
