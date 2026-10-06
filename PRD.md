# Product Requirement Document (PRD)
## Project: IndoKerja.id - Job Application Management System

---

### 1. Problem Statement
The hiring process in growing markets often suffers from fragmented communication, unorganized applicant tracking, and lack of transparency for job seekers. Job seekers submit applications into "black holes" without visibility into their status, while companies struggle with disorganized applicant lists and lack an auditable pipeline to track candidate progression.

**IndoKerja.id** is a streamlined Job Application Management platform built to solve these friction points:
1. A centralized job portal where job seekers can explore vacancies, apply once per position, and monitor real-time application status updates and progression history.
2. A secure applicant tracking dashboard for companies to post job vacancies, review applicants, and manage candidate progression through a discrete, auditable status lifecycle.

---

### 2. Target Users & Roles

1. **Job Seeker (`JOB_SEEKER`)**:
   - Individual seeking employment.
   - Core needs: Register/login, browse jobs, view job details, apply once per job, view applied jobs, track application status and review history.
2. **Company (`COMPANY`)**:
   - Hiring organization / recruiter.
   - Core needs: Register/login with company profile, create job vacancies, view candidates who applied to their jobs, update candidate status, and view status history.
3. **Guest (Unauthenticated)**:
   - Can browse public job listings and view job descriptions, but must log in to apply or post jobs.

---

### 3. Roles and Permissions Matrix

| Feature / Action | Guest | Job Seeker (`JOB_SEEKER`) | Company (`COMPANY`) |
| :--- | :---: | :---: | :---: |
| Register (Seeker or Company) | ✅ | ❌ | ❌ |
| Login / Logout (HTTP-only Cookie) | ✅ | ✅ | ✅ |
| Resolve Session (`GET /api/auth/me`) | ❌ | ✅ | ✅ |
| Browse Job Listings & View Details | ✅ | ✅ | ✅ |
| Apply to Job Vacancy | ❌ | ✅ (Max 1 per job) | ❌ (Blocked - 403) |
| View "My Applications" & History | ❌ | ✅ (Own applications) | ❌ (Blocked - 403) |
| Create Job Vacancies | ❌ | ❌ (Blocked - 403) | ✅ |
| View Candidates for a Vacancy | ❌ | ❌ (Blocked - 403) | ✅ (Owned jobs only - 403 if unowned) |
| Update Candidate Status | ❌ | ❌ (Blocked - 403) | ✅ (Owned jobs only - 403 if unowned) |
| View Candidate Application History | ❌ | ✅ (Own application) | ✅ (Owned jobs only - 403 if unowned) |

---

### 4. Functional Requirements

#### 4.1. Authentication & Session Management
- **FR-AUTH-01 (Registration)**:
  - Role selection: `JOB_SEEKER` or `COMPANY`.
  - For `JOB_SEEKER`: creates User record (email, hashed password, full name, phone).
  - For `COMPANY`: atomically creates User record AND `CompanyProfile` record (company name, optional location, industry, description) in a single database operation.
- **FR-AUTH-02 (Login)**:
  - Validates email and password using `bcrypt` comparison.
  - On success, issues a signed JWT stored inside a secure, `HTTP-only` cookie (`token`).
- **FR-AUTH-03 (Session Resolution)**:
  - `GET /api/auth/me` validates the HTTP-only cookie and returns user profile, role, and company details (if company).
- **FR-AUTH-04 (Logout)**:
  - `POST /api/auth/logout` clears the HTTP-only cookie.

#### 4.2. Job Seeker Experience
- **FR-SEEK-01 (Browse Vacancies)**:
  - Public job listing with lightweight search (title keyword, job type, location).
- **FR-SEEK-02 (View Job Details)**:
  - View vacancy details (title, company, description, requirements, location, salary, job type).
  - If authenticated as `JOB_SEEKER`, endpoint/UI indicates whether seeker has already applied.
- **FR-SEEK-03 (Apply for Vacancy)**:
  - Seeker applies with an optional cover note and resume URL / summary.
  - **Atomic Application Creation**: Application record is created with initial status `APPLIED` AND an initial `ApplicationHistory` entry is recorded (`previousStatus: null`, `newStatus: APPLIED`, `note: "Application submitted"`) inside a single database transaction.
- **FR-SEEK-04 (Single-Application Enforcement)**:
  - Strict database constraint: `@@unique([jobId, seekerId])`.
  - Duplicate application attempts return `409 Conflict`.
  - Frontend UI displays "Already Applied" and disables the application action.
- **FR-SEEK-05 (My Applications)**:
  - Seeker views all jobs they applied to with current status (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`).
  - View application timeline detailing each status change and feedback note.

#### 4.3. Company Experience
- **FR-COMP-01 (Create Job Vacancy)**:
  - Company creates job vacancy with title, description, requirements, location, job type, and optional salary range.
  - Vacancy is automatically associated with the authenticated company's `CompanyProfile`.
- **FR-COMP-02 (View Company Jobs)**:
  - Company views only their own posted vacancies with applicant counts.
- **FR-COMP-03 (View Candidates with Strict Ownership Guard)**:
  - Company views applicants for a specific job vacancy.
  - **Ownership Guard**: System verifies that the job belongs to the authenticated company. If another company attempts to view this endpoint, the API strictly returns `403 Forbidden`.
- **FR-COMP-04 (Atomic Candidate Status Update)**:
  - Allowed status lifecycle: `APPLIED` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `REJECTED` or `ACCEPTED`.
  - Company recruiter selects new status and inputs an optional note.
  - **Atomic Transaction**: Status update on `Application` and new row insertion in `ApplicationHistory` must execute within a single Prisma transaction (`prisma.$transaction`).
  - **Ownership Guard**: Before execution, verify that the application's job belongs to the authenticated company. Any cross-tenant attempt returns `403 Forbidden`.
- **FR-COMP-05 (Application Audit History)**:
  - Every status change is immutably stored with: `applicationId`, `previousStatus`, `newStatus`, `changedById`, `note`, `createdAt`.
  - Accessible only by the candidate owner (`JOB_SEEKER`) or the job owner (`COMPANY`).

---

### 5. Non-Functional Requirements (NFR)

- **NFR-SEC (Security)**:
  - Passwords hashed with `bcryptjs` (salt rounds = 10).
  - JWT stored in `HTTP-only`, `SameSite=Lax` cookie to eliminate XSS token theft.
  - Strict ownership checks on every candidate/job modification endpoint.
  - Input validation on all endpoints using Zod.
- **NFR-REL (Data Integrity & Concurrency)**:
  - Compound unique constraint `@@unique([jobId, seekerId])` eliminates race conditions for duplicate applications.
  - Prisma transactions ensure zero orphaned application histories.
- **NFR-PERF (Performance & Simplicity)**:
  - Indexed foreign keys (`userId`, `companyId`, `jobId`, `seekerId`).
  - Minimal dependency footprint; no bloated state management or heavy UI libraries.
- **NFR-UX (Responsive Interface)**:
  - Vanilla CSS design system optimized for desktop, tablet, and mobile.
  - Clean status color badges, confirmation modals, and timeline components.

---

### 6. Acceptance Criteria

1. **Authentication & Session**:
   - User can register as Job Seeker or Company (Company atomically creates `CompanyProfile`).
   - Logging in sets an `HTTP-only` cookie containing the JWT.
   - Refreshing the browser preserves session state via `GET /api/auth/me`.
   - Logging out clears the cookie and redirects to login/home.
2. **Single Application**:
   - A Job Seeker can apply to an open job once.
   - Subsequent application attempts are blocked with `409 Conflict`.
   - UI reflects "Already Applied" and disables submission.
3. **Company Ownership Protection**:
   - Company A cannot view candidates of Company B (returns `403 Forbidden`).
   - Company A cannot change candidate statuses of Company B (returns `403 Forbidden`).
4. **Status Transitions & Audit History**:
   - When an application is created, status is `APPLIED` and initial history entry exists.
   - When Company updates status to `REVIEWING`, `Application.status` becomes `REVIEWING` and an `ApplicationHistory` record is created atomically.
   - Job Seeker views "My Applications" and sees the updated status and timeline.

---

### 7. Explicit Out-of-Scope Features
To avoid over-engineering and ensure punctual completion:
- Resume PDF parsing / OCR.
- Real-time WebSockets / socket.io.
- Complex multi-tenant enterprise RBAC beyond `JOB_SEEKER` and `COMPANY`.
- Third-party OAuth2 (Google/GitHub/LinkedIn).
- Payment gateways and paid job promotions.
- Live chat between recruiter and applicant.
