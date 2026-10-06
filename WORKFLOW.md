# Development & Engineering Workflow (WORKFLOW.md)
## Project: IndoKerja.id - Job Application Management System

---

### Workflow Overview

To ensure rapid, defect-free execution within the assessment constraints, all engineering progress strictly follows the 7-stage lifecycle:

```
[1. Planning] ──> [2. Implementation] ──> [3. Testing] ──> [4. Code Review] ──> [5. QA & Edge Cases] ──> [6. Documentation] ──> [7. Deployment]
```

---

### Stage 1: Planning
1. **Requirements Ingestion**:
   - Deeply inspect assessment guidelines and extract functional/non-functional criteria.
2. **Deliverables Formulation**:
   - Lock planning documents (`PRD.md`, `ARCHITECTURE.md`, `AGENTS.md`, `TODO.md`, `SKILL.md`, `WORKFLOW.md`).
3. **Architectural Review & User Alignment**:
   - Conduct thorough architecture review.
   - Lock database constraints, HTTP-only cookie authentication, atomic transaction guarantees, and ownership checks.

---

### Stage 2: Implementation

#### 2.1. Backend-First Incremental Delivery
1. **Scaffold Directory & Config**:
   - Setup `backend/` with `package.json`, `tsconfig.json`, `.env.example`.
2. **Schema & Database Initialization**:
   - Write `backend/prisma/schema.prisma` with `@@unique([jobId, seekerId])`.
   - Run Prisma migration / push to local PostgreSQL (`localhost:5432`).
   - Implement `prisma/seed.ts` with demo accounts and pre-populated vacancies/applications.
3. **Core Infrastructure**:
   - Setup `AppError` and centralized error middleware with uniform JSON envelope.
   - Setup Zod validation middleware.
   - Setup `cookie-parser` and HTTP-only cookie JWT issuance.
   - Setup role and ownership middleware guards.
4. **Endpoint Implementation**:
   - Auth module (`register`, `login`, `me`, `logout`).
   - Job module (browse jobs, get detail, company job creation).
   - Application module:
     - `POST /api/applications/apply` (atomic transaction: Application + ApplicationHistory).
     - `GET /api/applications/my-applications` (Seeker view).
     - `GET /api/company/jobs/:jobId/candidates` (strict company ownership verification).
     - `PATCH /api/company/applications/:id/status` (strict ownership + atomic transaction).
     - `GET /api/company/applications/:id/history` (audit timeline).

#### 2.2. Frontend UI Implementation
1. **Scaffold Vite React App**:
   - Setup `frontend/` with TypeScript, `vite.config.ts`, `react-router-dom`.
2. **Design System & Base Tokens**:
   - Define Vanilla CSS variables for typography, color palette, buttons, cards, status tags, responsive containers.
3. **Auth & State Foundation**:
   - Build `AuthContext` with session hydration from `GET /api/auth/me` (`credentials: 'include'`).
   - Build Protected Route components (`<RequireAuth>`, `<RequireRole>`).
4. **Feature Views**:
   - Job browsing view with search and filters.
   - Job detail view with apply modal and single application status indicator.
   - Job seeker "My Applications" view with visual status cards and history timeline.
   - Company dashboard view (job list, candidate counts, create job form).
   - Company candidate review view with status transition modal and auditable notes.

---

### Stage 3: Testing & Local Verification
1. **Compilation & Type Check**:
   - Backend: Run `tsc --noEmit` to verify type safety.
   - Frontend: Run `npm run build` or `tsc --noEmit` to verify zero type mismatches.
2. **Targeted Verification Matrix (Core 8 Capabilities)**:
   - **Auth**: Register, Login (cookie set), `/api/auth/me` session restoration, Logout.
   - **Role Authorization**: Seeker cannot create jobs (403); Company cannot apply (403).
   - **Job Creation**: Company creates job -> appears in public browse.
   - **Application Submission**: Seeker applies -> status `APPLIED` + initial history created atomically.
   - **Duplicate Application Block**: Second application attempt returns `409 Conflict`.
   - **Company Ownership Guard**: Company B cannot view candidates or modify applications belonging to Company A (403 Forbidden).
   - **Status Update**: Company transitions candidate (`APPLIED` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `ACCEPTED` / `REJECTED`).
   - **Audit History**: History records created atomically in single database transactions.

---

### Stage 4: Code Review & Refactoring
1. **Adherence to Coding Standards**:
   - Review code against rules outlined in `AGENTS.md`.
   - Eliminate any duplicate logic, magic strings, or unused imports.
   - Ensure sensitive fields (`passwordHash`) are never exposed in API payloads.
2. **Transactional & Security Integrity**:
   - Verify all DB updates with audit history execute inside `prisma.$transaction`.
   - Verify all company endpoints enforce ownership checks.

---

### Stage 5: QA & Edge Case Validation
1. **Concurrent / Duplicate Application Defense**:
   - Verify DB-level constraint prevents duplicate rows.
2. **Cross-Tenant Isolation**:
   - Verify complete isolation between companies.
3. **UI Responsiveness Check**:
   - Test viewports: Mobile (375px), Tablet (768px), Desktop (1280px+).

---

### Stage 6: Documentation & Developer Experience
1. **README.md**:
   - Step-by-step setup guide for PostgreSQL, Prisma migrations, and frontend/backend dev servers.
   - Pre-seeded test accounts with passwords for instant reviewer testing.
2. **API Documentation**:
   - Concise reference for all REST endpoints with request parameters and response examples.

---

### Stage 7: Deployment & Handover
1. **Packaging**:
   - Verify production build commands (`npm run build` for both backend and frontend).
2. **Clean State Check**:
   - Ensure clean working directory, `.gitignore` covering `node_modules`, `.env`, and `dist`.
3. **Assessment Submission Readiness**:
   - Validate that all assessment deliverables and functional requirements are fully met.
