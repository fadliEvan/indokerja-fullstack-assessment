# IndoKerja.id - Implementation Roadmap (TODO.md)

---

### Phase 0: Workspace & Scaffolding Initialization
- [x] Initialize backend directory with TypeScript, `package.json`, and `tsconfig.json`.
- [x] Initialize frontend directory with React + TypeScript + Vite.
- [x] Install essential backend dependencies (`express`, `cors`, `cookie-parser`, `dotenv`, `zod`, `jsonwebtoken`, `bcryptjs`, `@prisma/client`).
- [x] Install backend dev dependencies (`prisma`, `tsx`, `typescript`, `@types/...`).
- [x] Install essential frontend dependencies (`react-router-dom`, `lucide-react`).
- [x] Configure environment files (`.env.example`, `.env`) with database connection string (`DATABASE_URL`) and JWT secret (`JWT_SECRET`).

---

### Phase 1: Database Modeling, Migrations & Seed Data
- [x] Define Prisma Schema in `backend/prisma/schema.prisma`:
  - [x] `User` model with `Role` enum (`JOB_SEEKER`, `COMPANY`).
  - [x] `CompanyProfile` model (1:1 with User).
  - [x] `JobVacancy` model (`companyId`, `title`, `description`, `requirements`, `location`, `jobType`, `status`).
  - [x] `Application` model (`jobId`, `seekerId`, `coverNote`, `resumeUrl`, `status`, `@@unique([jobId, seekerId])`).
  - [x] `ApplicationHistory` model (`applicationId`, `previousStatus`, `newStatus`, `changedById`, `note`, `createdAt`).
- [x] Apply Prisma migration (`20261006125851_init_schema`) to local PostgreSQL (`localhost:5432`).
- [x] Create seed script (`prisma/seed.ts`):
  - [x] Demo Company: `company@indokerja.id` / `Password123!` (PT Teknologi Nusantara).
  - [x] Second Company (for cross-tenant tests): `company2@indokerja.id` / `Password123!` (PT Maju Bersama).
  - [x] Demo Seeker: `seeker@indokerja.id` / `Password123!` (Budi Santoso).
  - [x] Second Seeker: `seeker2@indokerja.id` / `Password123!` (Siti Rahma).
  - [x] Pre-seeded Job Vacancies (Frontend Developer, Backend Engineer, UI Designer).
  - [x] Pre-seeded Applications with multi-stage history logs for instant demonstration.

---

### Phase 2: Backend Auth & Ownership Infrastructure
- [x] Implement central error handling (`AppError`, `errorHandler` middleware with standard JSON envelope).
- [x] Implement Zod validation middleware (`validateBody`, `validateQuery`, `validateParams`).
- [x] Implement `bcryptjs` password hashing and `jsonwebtoken` token issuance.
- [x] Implement `auth.middleware.ts`:
  - [x] Extract JWT from `req.cookies.token`.
  - [x] Decode user and attach `{ userId, email, role, companyProfileId? }` to `req.user`.
- [x] Implement `role.middleware.ts` (`requireRole('JOB_SEEKER')`, `requireRole('COMPANY')`).
- [x] Implement strict company ownership guards (`verifyJobOwnership`, `verifyApplicationOwnership`).
- [x] Implement Auth Controller & Routes:
  - [x] `POST /api/auth/register` (Atomic User + optional CompanyProfile creation).
  - [x] `POST /api/auth/login` (Verify password, set `HTTP-only` cookie).
  - [x] `GET /api/auth/me` (Hydrate user session).
  - [x] `POST /api/auth/logout` (Clear `HTTP-only` cookie).

---

### Phase 3: Backend Jobs & Atomic Applications
- [x] Implement Job Vacancy Endpoints:
  - [x] `GET /api/jobs` (Public job listing with keyword/type filter).
  - [x] `GET /api/jobs/:id` (Get vacancy detail, indicates if caller applied).
  - [x] `POST /api/company/jobs` (Company creates new vacancy).
  - [x] `GET /api/company/my-jobs` (Company lists own vacancies with candidate counts).
- [x] Implement Application Submission:
  - [x] `POST /api/applications/apply` (Restricted to `JOB_SEEKER`).
  - [x] Enforce single-application rule: Return `409 Conflict` if duplicate.
  - [x] **Atomic transaction**: Create `Application` (status `APPLIED`) + initial `ApplicationHistory` entry in `prisma.$transaction`.
  - [x] `GET /api/applications/my-applications` (Seeker lists applied jobs and statuses).
  - [x] `GET /api/applications/:id` (Seeker views single application detail & history).
- [x] Implement Company Candidate & Status Management with Ownership Guards:
  - [x] `GET /api/company/jobs/:jobId/candidates`:
    - Strict guard: Verify `job.companyId === req.user.companyProfileId`. Return `403` if not owner.
  - [x] `PATCH /api/company/applications/:id/status`:
    - Strict guard: Verify `application.job.companyId === req.user.companyProfileId`. Return `403` if not owner.
    - Lifecycle check: Ensure new status is one of (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`).
    - **Atomic transaction**: Update `Application.status` + insert new `ApplicationHistory` entry.
  - [x] `GET /api/company/applications/:id/history`:
    - Strict guard: Verify caller is the job owner or candidate owner. Return `403` if unauthorized.

---

### Phase 4: Frontend Scaffolding, Styling & Auth State
- [x] Build Vanilla CSS design system (`variables.css`, `global.css`, `components.css`):
  - [x] Cohesive color palette, responsive typography, cards, buttons, badges, alerts, spinners, form inputs.
- [x] Configure API client with `credentials: 'include'`:
  - [x] Central API client unwrapping success envelopes and mapping structured error codes.
  - [x] Zero JWT/token in `localStorage` or `sessionStorage`.
- [x] Implement strongly typed models matching backend API (`api.types`, `auth.types`, `job.types`, `application.types`).
- [x] Implement `AuthContext.tsx`:
  - [x] On mount, calls `GET /api/auth/me` to restore active session from HTTP-only cookie.
  - [x] Provides `login`, `register`, `logout`, `refreshSession`, `user`, and `isLoading`.
- [x] Build Navigation (`Navbar.tsx` & `Footer.tsx`) with role-aware links, user avatar/badge, responsive mobile menu, and Logout button.
- [x] Implement Protected Route components: `<ProtectedRoute allowedRoles={[...]}>` and `<GuestRoute>`.
- [x] Build Login & Register pages with tabbed role selection and validation error alerts.
- [x] Establish page structure and routing (`/`, `/jobs`, `/jobs/:id`, `/login`, `/register`, `/applications`, `/company/jobs`, `/company/jobs/new`, `/company/jobs/:jobId/candidates`, `*`).


---

### Phase 5: Frontend Job Seeker Features
- [x] Build Public Job Listings page (`/jobs`):
  - [x] Job search & filter bar (keyword, job type, location, reset filters).
  - [x] Responsive job cards with company info, location, salary, type badge, and posted date.
  - [x] Loading, error, and empty result states.
- [x] Build Job Detail page (`/jobs/:id`):
  - [x] Full job description & requirements.
  - [x] Company overview card with industry, location, description, and website.
  - [x] Apply modal (`ApplyModal.tsx`) with optional cover note & resume URL.
  - [x] Real-time application guard: If already applied, disable/hide apply button and show current status badge.
  - [x] Role-aware controls: Guest login CTA, Company notice, Seeker apply actions.
- [x] Build "My Applications" page (`/applications`):
  - [x] List of seeker's applications with StatusBadge (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).
  - [x] Loading, error, and empty states.
- [x] Build Application Detail page (`/applications/:id`):
  - [x] Full submission details (cover note, portfolio link).
  - [x] Chronological application history audit timeline with status badges, actors, and recruiter notes.


---

### Phase 6: Frontend Company Management Portal
- [x] Build Company Dashboard & Jobs page (`/company/jobs`):
  - [x] Metric overview cards (total vacancies, total applicants).
  - [x] List of posted vacancies with applicant counts, public link, and "Kelola Pelamar" button.
  - [x] Loading, error, and empty result states.
- [x] Build Create Job page (`/company/jobs/new`):
  - [x] Clean form for title, job type, location, salary range, negotiable toggle, description, requirements.
  - [x] Client-side & server-side validation error handling with salary range check.
  - [x] Automatic redirect to company jobs list upon creation.
- [x] Build Job Candidates page (`/company/jobs/:jobId/candidates`):
  - [x] Candidate table/cards: Name, email, phone, applied date, status badge, cover note & portfolio link.
  - [x] Search & filter candidates by name/email/status.
  - [x] Status transition modal (`StatusChangeModal.tsx`): Strict backend-aligned state machine transitions with review notes.
  - [x] Chronological audit history modal (`CandidateHistoryModal.tsx`) with actors and timestamps.
  - [x] Strict company ownership boundary: verified at backend with 403 Forbidden.


---

### Phase 7: Verification & QA Matrix
- [x] Verify Authentication & Cookie handling (login sets cookie, me fetches user, logout clears).
- [x] Verify Role Authorization (seeker cannot post job; company cannot apply).
- [x] Verify Job Creation (job appears in public listings).
- [x] Verify Application submission (status `APPLIED` + initial history created).
- [x] Verify Duplicate Application rejection (`409 Conflict` + UI disablement).
- [x] Verify Company Ownership Protection (Company A cannot access Company B candidates -> `403 Forbidden`).
- [x] Verify Status Transitions & Audit History (status updates propagate to history atomically).
- [x] Verify UI responsiveness (mobile, tablet, desktop).
- [x] Verified zero `localStorage`/`sessionStorage` token storage.
- [x] Verified database relational integrity, unique compound constraints, and bcrypt hash enforcement.


---

### Phase 8: Documentation, Final Cleanup & Handover
- [x] Write `README.md`:
  - [x] Project title & overview.
  - [x] Assessment scope & main features.
  - [x] Technology stack & architecture overview.
  - [x] Project structure & prerequisites.
  - [x] Environment variable configuration (.env.example verification).
  - [x] Local PostgreSQL setup & Prisma migrations.
  - [x] Seed execution command & reproducible test accounts.
  - [x] Development & production build commands.
  - [x] Pre-configured demo credentials (Company 1 & 2, Seeker 1 & 2).
  - [x] REST API documentation reference (`docs/api.md`).
  - [x] Database documentation reference (`docs/database.md`).
  - [x] Authentication & cookie security behavior.
  - [x] Role/authorization behavior & candidate state machine.
  - [x] Deployment instructions & Docker Compose configuration.
  - [x] Known limitations section.
- [x] Create comprehensive REST API documentation (`docs/api.md`).
- [x] Create database documentation & ERD (`docs/database.md`).
- [x] Verify `.env.example` cleanliness without secrets.
- [x] Clean up temporary verification scripts and logs.
- [x] Add minimal Docker Compose & Dockerfiles for reproducible deployment.
- [x] Pass all backend & frontend build, lint, typecheck, and migration status verifications.
- [x] Pass 10-step end-to-end smoke test.
- [x] Prepare Git repository with clean commit.

