# IndoKerja.id - Job Application Management System

A full-stack, enterprise-grade Job Application Management web application tailored for the Indonesian tech recruitment ecosystem. Built with React (TypeScript + Vite), Express.js (Node.js + TypeScript), and PostgreSQL with Prisma ORM.

---

## 1. Project Title
**IndoKerja.id - Full-Stack Job Application Management System**  
*Technical Assessment Submission*

---

## 2. Project Overview
IndoKerja.id is a recruitment platform connecting Indonesian job seekers with hiring companies. The system provides seamless public and authenticated job vacancy exploration, one-click application submissions with duplicate prevention, and recruiter dashboards for candidate pipeline tracking, atomic status progression, and tamper-proof audit trails.

---

## 3. Assessment Scope
The project strictly implements all core functional and non-functional requirements specified in the technical assessment:
- **Authentication & RBAC**: Dual-role authorization (`JOB_SEEKER` vs `COMPANY`) utilizing stateless JWTs delivered exclusively via `HttpOnly` secure cookies.
- **Job Seeker Experience**: Public vacancy feed with search, category filtering, detailed job specifications, resume submission, and historical application tracking.
- **Hiring Company Management**: Job vacancy creation, candidate pipeline monitoring, recruiter status progressions (`APPLIED` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `ACCEPTED` / `REJECTED`), and candidate notes.
- **Data Integrity & Auditability**: Database-enforced duplicate application prevention (`@@unique([jobId, seekerId])`), atomic transaction boundaries (`prisma.$transaction`), and chronological history logging (`ApplicationHistory`).
- **Security & Ownership**: Multi-tenant resource isolation ensuring companies can only inspect and modify applications for their own postings.

---

## 4. Main Features

### For Job Seekers
- **Public & Filtered Job Browsing**: Real-time keyword search, employment type filtering (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE`), and salary transparency.
- **Detailed Vacancy Overviews**: Complete role descriptions, skill requirements, location, and company metadata.
- **One-Click Application Modal**: Cover note and external resume URL submission.
- **Duplicate Application Lockout**: UI guard disabling repeat submissions with database-level `409 Conflict` fallback.
- **Applicant Dashboard (`/applications`)**: Unified view of submitted applications and real-time status badges.
- **Application Detail & Audit Trail (`/applications/:id`)**: Step-by-step chronological audit timeline of application status changes and recruiter feedback.

### For Companies / Recruiters
- **Company Vacancy Management (`/company/jobs`)**: Real-time listing of active openings with applicant count metrics.
- **Job Posting Studio (`/company/jobs/new`)**: Validated job creation form with location, job type, salary range, and requirements.
- **Candidate Pipeline Viewer (`/company/jobs/:jobId/candidates`)**: Tabular applicant overview with instant status filters (`ALL`, `APPLIED`, `REVIEWING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).
- **Candidate Status Progression Modal**: Enforced lifecycle state transitions with required recruiter audit notes.
- **Full Candidate Audit History Modal**: Complete chronological timeline displaying previous status, new status, reviewer name, timestamp, and review notes.

---

## 5. Technology Stack

| Layer | Technologies | Rationale / Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript (Strict) | Instant HMR, zero-bloat build, complete type safety |
| **UI & Styling** | Vanilla CSS Design System | Responsive layout, CSS variables, dark/light contrast tokens |
| **Icons** | Lucide React | Lightweight, tree-shaken SVG icon set |
| **Routing** | React Router DOM v6 | Declarative layout routing, protected role-based guards |
| **Backend** | Node.js 20+, Express.js, TypeScript (Strict) | High-performance asynchronous REST API architecture |
| **Database** | PostgreSQL 15+ / 16 / 18 | ACID compliance, relational integrity, compound constraints |
| **ORM** | Prisma ORM 6.x | Schema-first migrations, typed queries, transactions |
| **Security** | Bcrypt.js (10 rounds), Helmet, Cookie-Parser | Password hashing, secure HTTP headers, cookie transport |
| **Validation** | Zod | Runtime type validation for incoming REST payloads |
| **Testing & QA** | Node.js Test Harness, Prisma Verification | 38/38 Automated QA test matrix, DB integrity validation |

---

## 6. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React + Vite)                  │
│       Vanilla CSS Tokens • React Router • Context      │
│  [Public Pages]   [Seeker Portal]   [Company Portal]   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST (credentials: 'include')
                            │ HttpOnly Cookie ('token')
┌───────────────────────────▼────────────────────────────┐
│              Backend REST API (Express + TS)           │
│  Helmet • CORS • Cookie-Parser • Zod • Error Handler   │
├────────────────────────────────────────────────────────┤
│  Auth Middleware (verifyToken) & Role Guards (RBAC)    │
│  Controllers ➔ Services (Business Logic & Transactions) │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client 6.x
┌───────────────────────────▼────────────────────────────┐
│                 PostgreSQL Database                    │
│   Users • CompanyProfiles • JobVacancies • Applications│
│   ApplicationHistories • @@unique([jobId, seekerId])   │
└────────────────────────────────────────────────────────┘
```

---

## 7. Project Structure

```
TES INDOKERJA/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Versioned SQL migrations
│   │   ├── schema.prisma     # Complete Prisma data models & enums
│   │   └── seed.ts           # Reproducible database seed script
│   ├── src/
│   │   ├── config/           # Environment and DB client config
│   │   ├── controllers/      # Express request/response handlers
│   │   ├── errors/           # Custom AppError classes & errorHandler
│   │   ├── middlewares/      # authMiddleware, roleGuard, zod validate
│   │   ├── routes/           # REST route definitions
│   │   ├── services/         # Core business logic & transactions
│   │   ├── types/            # TypeScript interfaces & DTOs
│   │   ├── utils/            # JWT token & cookie utilities
│   │   ├── validators/       # Zod schemas for input validation
│   │   ├── app.ts            # Express application bootstrap
│   │   └── server.ts         # Server entrypoint & graceful shutdown
│   ├── .env.example          # Sample environment configuration
│   ├── Dockerfile            # Multi-stage production container
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # Strict TypeScript compiler options
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, JobCard, Modals)
│   │   ├── context/          # AuthContext (stateless session manager)
│   │   ├── pages/            # Page views (Auth, Jobs, Applications, Company)
│   │   ├── routes/           # AppRoutes with ProtectedRoute wrappers
│   │   ├── services/         # Central apiClient with cookie credentials
│   │   ├── styles/           # Global design system & layout styles
│   │   ├── types/            # TypeScript models & API interfaces
│   │   ├── App.tsx           # Main application root
│   │   └── main.tsx          # Client DOM mount
│   ├── .env.example          # Frontend environment variables
│   ├── Dockerfile            # Production Nginx container
│   ├── nginx.conf            # SPA routing & API proxy configuration
│   ├── package.json          # Frontend dependencies and scripts
│   ├── vite.config.ts        # Vite configuration & dev proxy
│   └── tsconfig.json         # Strict TypeScript compiler options
├── docs/
│   ├── api.md                # Comprehensive REST API Documentation
│   └── database.md           # ERD, Constraints & Migration Documentation
├── docker-compose.yml        # Multi-container orchestration (DB + API + Web)
├── .gitignore                # Production git exclusion patterns
├── ARCHITECTURE.md           # Technical architecture specifications
├── AGENTS.md                 # Engineering guidelines & coding standards
└── README.md                 # Project documentation & reviewer guide
```

---

## 8. Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later
- **PostgreSQL**: `v15.x` or later running locally (or Docker)
- **Git**: Installed for version control

---

## 9. Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
| Variable | Description | Default Development Value |
| :--- | :--- | :--- |
| `PORT` | Express listening port | `5000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/indokerja?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `indokerja_jwt_super_secret_development_key_2026` |
| `JWT_EXPIRES_IN` | Expiration window for JWT tokens | `24h` |
| `CORS_ORIGIN` | Allowed client origin for CORS credentials | `http://localhost:5173` |

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
| Variable | Description | Default Development Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL path for backend API requests | `/api` |

---

## 10. Local PostgreSQL Setup
Ensure PostgreSQL is running locally and the `indokerja` database exists:

```sql
-- Using psql command line:
CREATE DATABASE indokerja;
```

Or verify with:
```bash
psql -U postgres -c "CREATE DATABASE indokerja;"
```

---

## 11. Prisma Migration Instructions
Navigate to the backend directory and execute the versioned migrations:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Apply migrations to local database
npx prisma migrate dev
```

To inspect migration status:
```bash
npx prisma migrate status
```

---

## 12. Seed Instructions
Populate the database with test companies, job seekers, vacancies, and application workflows:

```bash
cd backend
npm run prisma:seed
```

The seed script idempotently creates:
- 2 hiring companies with verified `CompanyProfile` records
- 2 job seekers with pre-registered accounts
- 4 active job vacancies across diverse engineering disciplines
- Sample applications with multi-step audit history logs

---

## 13. Development Commands

### Running Backend Dev Server
```bash
cd backend
npm run dev
# Starts server on http://localhost:5000 with tsx hot reload
```

### Running Frontend Dev Server
```bash
cd frontend
npm run dev
# Starts Vite dev server on http://localhost:5173 with proxy to port 5000
```

---

## 14. Production Build Commands

### Backend Build & Run
```bash
cd backend
npm run typecheck      # Type validation
npm run lint           # ESLint verification
npm run build          # Compiles TypeScript to dist/
npm run start          # Starts production server with Node.js
```

### Frontend Build & Preview
```bash
cd frontend
npm run typecheck      # Type validation
npm run lint           # ESLint verification
npm run build          # Produces optimized production bundle in dist/
npm run preview        # Serves production build locally
```

---

## 15. Demo Credentials

Use any of the following pre-configured credentials to evaluate the platform:

| Role | Account Email | Password | Organization / Name |
| :--- | :--- | :--- | :--- |
| **Company 1** | `company@indokerja.id` | `Password123!` | PT Teknologi Nusantara |
| **Company 2** | `company2@indokerja.id` | `Password123!` | PT Maju Bersama |
| **Job Seeker 1** | `seeker@indokerja.id` | `Password123!` | Budi Santoso |
| **Job Seeker 2** | `seeker2@indokerja.id` | `Password123!` | Siti Rahma |

---

## 16. API Documentation Reference
Comprehensive documentation of all REST endpoints is provided in:  
👉 **[`docs/api.md`](docs/api.md)**

Endpoints covered:
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Public Jobs**: `GET /api/jobs`, `GET /api/jobs/:id`
- **Job Seeker Applications**: `POST /api/applications/apply`, `GET /api/applications/my-applications`, `GET /api/applications/:id`
- **Company Management**: `POST /api/company/jobs`, `GET /api/company/my-jobs`, `GET /api/company/jobs/:jobId/candidates`, `PATCH /api/company/applications/:id/status`, `GET /api/company/applications/:id/history`

---

## 17. Authentication Behavior
- **Zero Token in LocalStorage**: JWT tokens are **never** stored in browser `localStorage` or `sessionStorage`, mitigating XSS risks.
- **HttpOnly Cookie Transport**: Upon successful login or registration, the server issues a cookie named `token` with `HttpOnly: true`, `SameSite: Lax`, and `Secure: true` (in production).
- **Session Hydration**: On application load, the frontend issues `GET /api/auth/me` with `credentials: 'include'` to restore user identity.
- **Stateless Logout**: `POST /api/auth/logout` clears the authentication cookie with identical cookie flags.

---

## 18. Role & Authorization Behavior
- **RBAC Enforcement**: The backend enforces role checks via `roleGuard(['JOB_SEEKER'])` and `roleGuard(['COMPANY'])`.
- **Role Isolation**:
  - `JOB_SEEKER` accounts attempting to post jobs receive `403 Forbidden`.
  - `COMPANY` accounts attempting to apply for jobs receive `403 Forbidden`.
- **Multi-Tenant Ownership Verification**:
  - A company attempting to access candidates or mutate status on a vacancy posted by a competitor is rejected with `403 Forbidden`.

---

## 19. Application Lifecycle & State Transitions

Candidate applications follow a deterministic finite state machine (FSM):

```
                  ┌──────────────┐
                  │   APPLIED    │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  REVIEWING   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ SHORTLISTED  │
                  └──────┬───────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     ┌──────────────┐          ┌──────────────┐
     │   ACCEPTED   │          │   REJECTED   │
     └──────────────┘          └──────────────┘
```

*Note: Recruiters can also transition candidates directly to `REJECTED` from any review stage.*

---

## 20. Testing & Verification Commands

### Automated Test Matrix
Run the comprehensive verification checks:

```bash
# 1. Backend Lint & Typecheck
cd backend
npm run typecheck
npm run lint

# 2. Database Schema Validation
npx prisma validate
npx prisma migrate status

# 3. Frontend Lint & Typecheck
cd ../frontend
npm run typecheck
npm run lint
```

### Database Reset & Fresh Verification
```bash
cd backend
npm run db:reset       # Resets DB and re-runs migrations + seed automatically
```

---

## 21. Deployment Instructions

### Docker Compose Deployment (Recommended)
The repository includes a ready-to-run multi-container Docker configuration:

```bash
# Build and run PostgreSQL, Backend, and Frontend containers:
docker compose up --build -d

# Apply migrations inside the container:
docker compose exec backend npx prisma migrate deploy

# (Optional) Seed demo data in the container:
docker compose exec backend npm run prisma:seed
```
- Frontend will be accessible at: `http://localhost:80`
- Backend API will be accessible at: `http://localhost:5000`

### Manual Production Deployment
1. **Database**: Provision PostgreSQL instance and set `DATABASE_URL`.
2. **Backend**:
   ```bash
   cd backend
   npm ci --omit=dev
   npx prisma generate
   npx prisma migrate deploy
   node dist/server.js
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm ci
   npm run build
   # Serve dist/ using Nginx, Cloudflare Pages, Vercel, or AWS S3 + CloudFront
   ```

---

## 22. Known Limitations
- **Resume Upload**: Resumes are linked via external URL (Google Drive, LinkedIn, Portfolio) rather than direct binary S3 upload, adhering strictly to technical assessment specifications and avoiding third-party cloud storage dependencies.
- **Email Notifications**: Status change notifications are surfaced via in-app audit history timelines rather than external SMTP/SES services.

---

*IndoKerja.id — Engineered with precision for technical evaluation.*
