# EventRegistrationCore

A full-stack, enterprise-grade Event Registration Platform built with **NestJS** (backend) and **Next.js 15** (frontend). The system manages the complete event lifecycle — from creation and registration through ticketing, QR-based attendance scanning, and analytics.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Install Dependencies](#install-dependencies)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Shared Components](#shared-components)
- [Scripts Reference](#scripts-reference)
- [Code Quality](#code-quality)

---

## Architecture Overview

```
EventRegistrationCore/
├── src/                  # NestJS backend (API server)
│   └── modules/          # Feature modules
├── frontend/             # Next.js 15 frontend (admin dashboard)
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # Shared UI components
│       ├── shared/       # Reusable utilities and widgets
│       └── lib/          # API client, hooks, types
└── prisma/               # Database schema and migrations
```

The backend runs on **port 3000** and exposes a RESTful JSON API. The frontend runs on **port 3001** and communicates with the backend via `fetch` with TanStack Query for caching and mutations.

All API responses are wrapped in a standardized envelope:
```json
{ "success": true, "data": <payload> }
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| [NestJS 10](https://nestjs.com) | API framework with decorators, DI, guards |
| [Prisma 5](https://www.prisma.io) | Type-safe ORM for PostgreSQL |
| [PostgreSQL](https://postgresql.org) | Primary relational database |
| [Swagger / OpenAPI](https://swagger.io) | Auto-generated API docs (`/api`) |
| [Nodemailer](https://nodemailer.com) | SMTP email notifications |
| [QRCode](https://github.com/soldair/node-qrcode) | QR code generation for tickets |
| [Winston](https://github.com/winstonjs/winston) | Structured application logging |
| [Multer](https://github.com/expressjs/multer) | File upload handling |
| [class-validator](https://github.com/typestack/class-validator) | DTO validation |

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework with App Router |
| [React 19](https://react.dev) | UI library |
| [TanStack Query v5](https://tanstack.com/query) | Server state, caching, mutations |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [Lucide React](https://lucide.dev) | Icon library |
| [qrcode.react](https://github.com/zpao/qrcode.react) | QR code rendering in modals |
| [html-to-image](https://github.com/bubkoo/html-to-image) | Ticket PNG download |

---

## Project Structure

### Backend (`src/`)

```
src/
├── modules/
│   ├── analytics/       # Dashboard stats, event metrics, trend data
│   ├── announcements/   # Event announcements and bulk email
│   ├── attendance/      # Ticket scanning and attendance verification
│   ├── audit-logs/      # Action audit trail
│   ├── events/          # Event CRUD, agenda, speakers, form builder
│   ├── notifications/   # In-app notifications
│   ├── registrations/   # Registrations with paginated server-side filtering
│   ├── roles/           # RBAC role management
│   ├── tickets/         # Ticket generation, regeneration, email delivery
│   └── users/           # User management
├── common/
│   ├── dto/             # Shared DTOs (PaginationDto)
│   ├── guards/          # Auth guards
│   └── interceptors/    # Transform response interceptor
├── shared/
│   └── services/        # Email service (Nodemailer)
├── config/              # App configuration module
├── database/            # Prisma service
├── app.module.ts
└── main.ts
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── app/
│   ├── dashboard/       # Stats overview
│   ├── events/          # Event list, detail, create, edit
│   ├── registrations/   # Registrations table with filters
│   ├── tickets/         # Ticket list + TicketDetailsModal
│   ├── attendance/      # Scan-to-check-in + attendance table
│   ├── announcements/   # Create & manage announcements
│   └── analytics/       # Charts and trend visualizations
├── components/
│   └── TicketDetailsModal.tsx   # Premium ticket view with QR + download
├── shared/
│   ├── components/      # Pagination, StatusBadge, SearchInput,
│   │                    # DateFilter, StatusFilter, TableToolbar
│   └── utils/           # formatDate, formatDateTime
└── lib/
    ├── api.ts           # Typed fetch functions (envelope-aware)
    ├── hooks.ts         # TanStack Query hooks
    └── types.ts         # TypeScript interfaces
```

---

## Database Schema

Core models and their relationships:

```
User ──< UserRole >── Role
User ──< Event (as organizer)
User ──< Registration
User ──< Notification

Event ──< EventAgenda
Event ──< EventSpeaker
Event ──< FormField
Event ──< Registration ──── Ticket ──< AttendanceLog
Event ──< Announcement
```

### Enums

| Enum | Values |
|---|---|
| `EventStatus` | `DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `ONGOING`, `COMPLETED`, `ARCHIVED` |
| `EventMode` | `ONLINE`, `OFFLINE`, `HYBRID` |
| `RegistrationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `TicketStatus` | `ACTIVE`, `USED`, `CANCELLED` |
| `RoleName` | `SUPER_ADMIN`, `ADMIN`, `ORGANIZER`, `VOLUNTEER`, `SCANNER` |
| `FieldType` | `TEXT`, `EMAIL`, `PHONE`, `NUMBER`, `DROPDOWN`, `RADIO`, `CHECKBOX`, `TEXTAREA` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14 (running locally or via Docker)

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Key variables to configure:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_registration_core?schema=public"

# App
APP_PORT=3000
APP_URL=http://localhost:3000

# JWT (change in production!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Install Dependencies

**Backend:**
```bash
# In project root
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Database Setup

```bash
# 1. Push the schema to the database
npx prisma db push

# 2. Generate the Prisma client
npm run prisma:generate

# 3. Seed with sample data (3 events, 3 registrations, 3 tickets)
npm run prisma:seed

# (Optional) Open Prisma Studio to browse data
npm run prisma:studio
```

### Running the Application

**Backend (NestJS)** — runs on `http://localhost:3000`:
```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

**Frontend (Next.js)** — defaults to `http://localhost:3001`:
```bash
cd frontend

# Development (auto-selects next free port if 3001 is taken)
npm run dev

# Production build
npm run build
npm run start
```

> **Note:** Next.js will automatically increment the port (3001 → 3002 → ...) if the default
> is already in use. Make sure only one `npm run dev` process is running at a time.

**API Documentation (Swagger UI):** `http://localhost:3000/api`

---

## API Reference

All endpoints return `{ success: true, data: <payload> }` on success.

### Events
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List events (paginated, filterable) |
| `POST` | `/api/events` | Create a new event |
| `GET` | `/api/events/:id` | Get event details |
| `PATCH` | `/api/events/:id` | Update event |
| `DELETE` | `/api/events/:id` | Delete event |
| `POST` | `/api/events/:id/poster` | Upload poster image |

### Registrations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/registrations` | List all registrations (filterable: `eventId`, `status`, `search`, `startDate`, `endDate`) |
| `POST` | `/api/registrations` | Create registration |
| `GET` | `/api/registrations/:id` | Get registration detail |
| `PATCH` | `/api/registrations/:id/cancel` | Cancel a registration |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | List all tickets (paginated, filterable) |
| `GET` | `/api/tickets/:id` | Get ticket detail |
| `GET` | `/api/tickets/code/:code` | Look up ticket by ticket code |
| `POST` | `/api/tickets/:id/regenerate` | Regenerate ticket code and QR |
| `POST` | `/api/tickets/:id/email` | Email ticket to attendee |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attendance/verify` | Verify and scan a ticket (`{ ticketCode, scannerId }`) |
| `GET` | `/api/attendance` | List all attendance records (filterable) |
| `GET` | `/api/attendance/event/:eventId` | Attendance records for a specific event |
| `GET` | `/api/attendance/stats/:eventId` | Attendance stats for an event |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Dashboard KPIs |
| `GET` | `/api/analytics/popular-events` | Events ranked by registrations |
| `GET` | `/api/analytics/registrations-over-time` | Daily registration trend |
| `GET` | `/api/analytics/attendance-over-time` | Daily attendance trend |
| `GET` | `/api/analytics/events-by-status` | Event count by status |
| `GET` | `/api/analytics/registrations-by-event` | Registration counts grouped by event |

### Announcements
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/announcements/event/:eventId` | List announcements for an event |
| `POST` | `/api/announcements` | Create announcement (optionally send email) |
| `DELETE` | `/api/announcements/:id` | Delete announcement |

---

## Frontend Pages

| Route | Description |
|---|---|
| `/dashboard` | KPI overview — total events, registrations, tickets, attendance rate |
| `/events` | Paginated event cards with status filters |
| `/events/create` | Multi-step wizard: Basic Info → Agenda → Speakers → Form Builder |
| `/events/:id` | Event detail with registration list |
| `/events/edit/:id` | Edit existing event (same wizard) |
| `/registrations` | Registrations table with search, status, event, and date filters |
| `/registrations/:id` | Registration detail with ticket info |
| `/tickets` | Ticket table — view ticket modal with QR code and PNG download |
| `/attendance` | Ticket scan/verify panel + attendance log with filters |
| `/announcements` | Create and manage announcements per event |
| `/analytics` | Charts: registration trend, attendance trend, popular events, status breakdown |

---

## Shared Components

Located in `frontend/src/shared/components/`:

| Component | Props | Description |
|---|---|---|
| `Pagination` | `page`, `totalPages`, `onPageChange`, `isLoading` | Page navigator with ellipsis |
| `StatusBadge` | `status`, `type` | Color-coded badge for Registration/Ticket/Event statuses |
| `SearchInput` | `value`, `onChange`, `placeholder` | Debounced text search field with icon |
| `DateFilter` | `value`, `onChange`, `label` | Date picker for range filtering |
| `StatusFilter` | `value`, `onChange`, `options` | Dropdown status selector |
| `TableToolbar` | `children` | Flex toolbar wrapper for filters and action buttons |

Utilities in `frontend/src/shared/utils/`:

| Utility | Description |
|---|---|
| `formatDate(dateString)` | Returns `"Jun 10, 2026"` format |
| `formatDateTime(dateString)` | Returns `"Jun 10, 2026, 10:30 AM"` format |

---

## Scripts Reference

### Backend (project root)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run start:dev` | NestJS with hot-reload |
| Build | `npm run build` | Compile to `dist/` |
| Production | `npm run start:prod` | Run compiled build |
| Lint | `npm run lint` | ESLint with auto-fix |
| Format | `npm run format` | Prettier on `src/` |
| DB Push | `npx prisma db push` | Sync schema without migration |
| DB Migrate | `npm run prisma:migrate` | Create and run migration |
| DB Seed | `npm run prisma:seed` | Insert sample data |
| Prisma Studio | `npm run prisma:studio` | Visual DB browser |

### Frontend (`frontend/`)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Next.js with HMR on port 3001 |
| Build | `npm run build` | Production build with type-check |
| Start | `npm run start` | Serve production build |
| Lint | `npm run lint` | ESLint via Next.js config |

---

## Code Quality

The project enforces consistent code quality across both packages:

- **Prettier** — Formatting enforced on save and at build time (`.prettierrc` at root)
- **ESLint** — TypeScript-aware rules with `no-unused-vars`, `no-console` rules
- **TypeScript strict mode** — Full type safety on both backend and frontend
- **Prisma** — Type-safe database access — no raw SQL

To format all files:
```bash
# Backend
npm run format

# Frontend
cd frontend
npx prettier --write .
```
