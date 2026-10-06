# Agent Operational Guidelines & Coding Standards
## Project: IndoKerja.id - Job Application Management System

---

### 1. General Principles
1. **Strictly Requirements-Driven**: Treat the technical assessment specifications as absolute ground truth. Do not invent unrequested features that jeopardize delivery within the assessment timeline.
2. **KISS & YAGNI**: Keep It Simple and Avoid Speculative Generalization. Build clean, minimal, functional, and maintainable software.
3. **No Phantom Code**: Every controller, service, route, and component must be active and wired up. Avoid orphan endpoints or unused files.

---

### 2. TypeScript & Code Standards

- **Strict Mode Enabled**: Both frontend and backend `tsconfig.json` must have `"strict": true`, `"noImplicitAny": true`, and `"strictNullChecks": true`.
- **No `any` Types**: Explicitly define DTOs, parameters, and return types. Use `unknown` with type narrowing if external data type is uncertain.
- **Async/Await Consistency**: Always use `async/await` instead of raw `.then()/.catch()` chains. Wrap service calls in controllers with try/catch or use an `asyncHandler` wrapper to delegate errors to centralized error middleware.
- **Immutability & Purity**: Avoid mutating objects or arrays directly. Favor array helper functions (`.map()`, `.filter()`, `.reduce()`) and spread operators.

---

### 3. Naming Conventions

| Category | Convention | Examples |
| :--- | :--- | :--- |
| **Files (Backend)** | `kebab-case.role.ts` | `auth.controller.ts`, `job.service.ts`, `auth.middleware.ts` |
| **Files (Frontend Components)** | `PascalCase.tsx` | `JobCard.tsx`, `CandidateTable.tsx`, `Navbar.tsx` |
| **Files (Frontend Utils/Hooks)** | `camelCase.ts` | `useAuth.ts`, `formatDate.ts`, `api.ts` |
| **Database Models** | `PascalCase` | `User`, `CompanyProfile`, `JobVacancy`, `ApplicationHistory` |
| **Database Fields** | `camelCase` (Prisma) mapped to PostgreSQL columns | `companyId`, `createdAt`, `passwordHash` |
| **API Endpoints** | `kebab-case` plural nouns | `/api/jobs`, `/api/applications`, `/api/company/candidates` |
| **TypeScript Types & Interfaces** | `PascalCase` | `CreateJobDto`, `ApplicationResponse`, `UserSession` |
| **Enums** | `UPPER_SNAKE_CASE` | `JOB_SEEKER`, `APPLIED`, `REVIEWING`, `FULL_TIME` |

---

### 4. API & Communication Conventions

- **Uniform Response Envelope**:
  - Success: `{ "success": true, "message": "...", "data": ... }`
  - Failure: `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`
- **Proper HTTP Status Codes**:
  - `200 OK`: Successful read or update.
  - `201 Created`: Successful resource creation (registration, new job, new application).
  - `400 Bad Request`: Validation failure or malformed payload.
  - `401 Unauthorized`: Missing or invalid session cookie.
  - `403 Forbidden`: Authenticated user lacks permission (wrong role or not resource owner).
  - `404 Not Found`: Target resource does not exist.
  - `409 Conflict`: Resource state conflict (duplicate email, duplicate job application).
  - `500 Internal Server Error`: Unhandled server exceptions.
- **Cookie-Based Stateless Authentication**: Store JWT inside a secure `HTTP-only` cookie (`token`). Client requests must configure `credentials: 'include'` (or `withCredentials: true`).

---

### 5. Database Conventions (Prisma & PostgreSQL)

- **Foreign Keys**: Every relation must have an explicit foreign key and reference index.
- **Compound Constraints**: Duplicate application prevention must be enforced at the schema level:
  ```prisma
  @@unique([jobId, seekerId])
  ```
- **Enum Synchronization**: Database enums must match application enums exactly:
  - `Role`: `JOB_SEEKER`, `COMPANY`
  - `JobType`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE`
  - `JobStatus`: `OPEN`, `CLOSED`
  - `ApplicationStatus`: `APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`
- **Mandatory Prisma Transactions (`prisma.$transaction`)**:
  1. **Company Registration**: Atomically create `User` + `CompanyProfile`.
  2. **Application Submission**: Atomically create `Application` (status `APPLIED`) + initial `ApplicationHistory` entry.
  3. **Candidate Status Change**: Atomically update `Application.status` + insert new `ApplicationHistory` row.

---

### 6. Security & Company Ownership Rules

- **Zero Plaintext Passwords**: Hash all passwords with `bcryptjs` using at least 10 rounds before saving.
- **Sanitized Outputs**: Never return `passwordHash` or internal secrets in any API response.
- **Input Validation**: All incoming requests must be validated with Zod schemas prior to hitting controllers.
- **Strict Company Ownership Verification**:
  - When querying `/api/company/jobs/:jobId/candidates`: verify `job.companyId === req.user.companyProfileId`.
  - When mutating `/api/company/applications/:id/status`: fetch the application, join `job`, and verify `application.job.companyId === req.user.companyProfileId`. If mismatched, immediately reject with `403 Forbidden`.
  - When querying `/api/company/applications/:id/history`: verify ownership of application's parent job. Mismatch returns `403 Forbidden`.
- **Secret Management**: Passwords, database URLs, and JWT secrets must always be loaded from `.env`.

---

### 7. Testing Rules

- **Targeted Integration & Verification Matrix**:
  1. **Authentication**: Register Seeker, Register Company (verify CompanyProfile), Login (verify cookie set), `/api/auth/me`, Logout (verify cookie cleared).
  2. **Role Authorization**: Seeker attempts to post a job (verify 403); Company attempts to apply (verify 403).
  3. **Job Creation**: Company creates job vacancy -> appears in public job feed.
  4. **Application Submission**: Seeker applies to job -> verify status is `APPLIED` and initial `ApplicationHistory` is logged.
  5. **Duplicate Application**: Seeker attempts applying to the same job a second time -> verify blocked with `409 Conflict`.
  6. **Company Ownership Guard**: Company A attempts to view candidates or change candidate status on a job posted by Company B -> verify blocked with `403 Forbidden`.
  7. **Status Update & Audit History**: Company updates candidate status (`APPLIED` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `ACCEPTED` / `REJECTED`) -> verify `ApplicationHistory` entries are recorded chronologically.

---

### 8. Dependency Management Rules

- **Strict Ban on Bloatware**:
  - No `lodash`, `moment.js`, or complex date frameworks (use native JavaScript `Date` or `Intl`).
  - No heavy UI component frameworks (no Material UI, no Ant Design). Use bespoke Vanilla CSS with CSS variables.
  - Standard backend packages: `express`, `cors`, `cookie-parser`, `dotenv`, `zod`, `jsonwebtoken`, `bcryptjs`, `@prisma/client`.
  - Standard frontend packages: `react`, `react-dom`, `react-router-dom`, `lucide-react` (icons only).

---

### 9. Frontend & Backend Synchronization Rules

- **Type Alignment**: Shared DTO types must match between backend validators and frontend API consumers:
  - When backend changes a model or endpoint response, immediately update the corresponding TypeScript interface in `frontend/src/types/`.
- **Status Enum Sync**: The application status list (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`) must remain identical across Prisma schema, backend enums, and frontend status constants.

---

### 10. Rules for Modifying Existing Files

- Always view the file contents before editing.
- Preserve existing comments, formatting, and stylistic patterns.
- Do not make breaking edits without adjusting dependent modules.
- Ensure all imports remain resolved and clean after edits.
