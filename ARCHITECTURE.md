# System Architecture Document
## Project: IndoKerja.id - Job Application Management System

---

### 1. High-Level System Architecture

IndoKerja.id is built as a client-server architecture with an Express.js REST API and a React + TypeScript SPA.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|                  React 18/19 + TypeScript + Vite (SPA)                  |
|   - Vanilla CSS Design System (Custom properties, responsive grid)      |
|   - Role-Based Protected Routes (<ProtectedRoute role="..." />)         |
|   - Credentials: 'include' (Cookie-based session transport)             |
+------------------------------------+------------------------------------+
                                     | HTTPS / JSON (REST)
                                     | Cookie: token=<jwt>
                                     v
+-------------------------------------------------------------------------+
|                              Server Layer                               |
|                    Node.js + Express.js + TypeScript                    |
|  +-------------------------------------------------------------------+  |
|  | Security Pipeline: Helmet, CORS (credentials: true), CookieParser |  |
|  +-------------------------------------------------------------------+  |
|  | Auth Middleware: HTTP-Only Cookie JWT Verification                |  |
|  +-------------------------------------------------------------------+  |
|  | Authorization & Company Ownership Guards (403 Forbidden checks)   |  |
|  +-------------------------------------------------------------------+  |
|  | Validation Pipeline: Zod Request Schemas                          |  |
|  +-------------------------------------------------------------------+  |
|  | Controllers & Services: Atomic Prisma Transactions                |  |
|  +-------------------------------------------------------------------+  |
|  | Centralized Error Handling Middleware                             |  |
+------------------------------------+------------------------------------+
                                     | TCP Connection Pool
                                     v
+-------------------------------------------------------------------------+
|                             Database Layer                              |
|                          PostgreSQL 18 + Prisma                         |
|   - Foreign Keys & Referential Integrity                                |
|   - Database-level Unique Constraint: @@unique([jobId, seekerId])       |
|   - Application & ApplicationHistory audit logging in single txn        |
+-------------------------------------------------------------------------+
```

---

### 2. Frontend Architecture (React.js + TypeScript + Vite)

#### 2.1. Core Tech Stack
- **Framework**: React 18 / 19 with Vite.
- **Language**: TypeScript (strict mode enabled).
- **Styling**: Vanilla CSS utilizing CSS Custom Properties for design tokens (palette, spacing, elevation, micro-interactions). No heavy UI dependencies.
- **Routing**: `react-router-dom` v6 with role-based route protection.
- **State & Transport**: React Context (`AuthContext`) paired with native `fetch` or Axios configured with `withCredentials: true`. Session restored on load via `GET /api/auth/me`.

#### 2.2. Page & Component Structure
```
App
├── AuthProvider (Restores session via /api/auth/me, holds user state)
└── Router
    ├── Public Routes
    │   ├── Navbar & Footer
    │   ├── JobBrowsePage (Public search & list)
    │   ├── JobDetailPage (Details + Apply action)
    │   ├── LoginPage (Email, password, role redirect)
    │   └── RegisterPage (Tabbed Seeker vs Company registration)
    │
    ├── Job Seeker Protected Routes (allowedRole: 'JOB_SEEKER')
    │   ├── SeekerApplicationsPage (List of applied jobs + status tags)
    │   └── ApplicationDetailModal (Status history timeline)
    │
    └── Company Protected Routes (allowedRole: 'COMPANY')
        ├── CompanyDashboardPage (Overview of active jobs & candidate metrics)
        ├── CompanyCreateJobPage (Create vacancy form)
        └── CompanyCandidatesPage (Applicant list, status update modal, audit trail)
```

---

### 3. Backend Architecture (Node.js + Express.js + TypeScript)

#### 3.1. Layered Pattern
1. **Routes (`/routes`)**: Define HTTP verbs, attach Zod validation and auth/ownership middleware.
2. **Validation (`/validators`)**: Zod schemas for body, params, and query.
3. **Middlewares (`/middlewares`)**:
   - `auth.middleware.ts`: Extracts JWT from `req.cookies.token`, verifies signature, populates `req.user`.
   - `role.middleware.ts`: Validates `req.user.role === requiredRole`.
   - `ownership.middleware.ts`: Ensures target job or application belongs to the calling company.
   - `error.middleware.ts`: Catches all synchronous and asynchronous errors and formats a uniform JSON envelope.
4. **Controllers (`/controllers`)**: Handle HTTP parameters, call services, set HTTP status codes, and manage cookies (`res.cookie`, `res.clearCookie`).
5. **Services (`/services`)**: Encapsulate business logic and atomic Prisma operations.
6. **Data Access (`/prisma`)**: Prisma schema, migrations, and database client singleton.

---

### 4. Database Architecture (PostgreSQL + Prisma)

#### 4.1. Entity Relationship Design

```prisma
enum Role {
  JOB_SEEKER
  COMPANY
}

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  REMOTE
}

enum JobStatus {
  OPEN
  CLOSED
}

enum ApplicationStatus {
  APPLIED
  REVIEWING
  SHORTLISTED
  REJECTED
  ACCEPTED
}

model User {
  id              String               @id @default(uuid())
  email           String               @unique
  passwordHash    String
  fullName        String
  phone           String?
  role            Role
  companyProfile  CompanyProfile?
  applications    Application[]        @relation("SeekerApplications")
  historyChanges  ApplicationHistory[] @relation("ChangedByUser")
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@index([email])
}

model CompanyProfile {
  id          String       @id @default(uuid())
  userId      String       @unique
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName String
  industry    String?
  location    String?
  description String?      @db.Text
  website     String?
  jobs        JobVacancy[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([userId])
}

model JobVacancy {
  id           String        @id @default(uuid())
  companyId    String
  company      CompanyProfile @relation(fields: [companyId], references: [id], onDelete: Cascade)
  title        String
  description  String        @db.Text
  requirements String        @db.Text
  location     String
  jobType      JobType       @default(FULL_TIME)
  salaryMin    Int?
  salaryMax    Int?
  isNegotiable Boolean       @default(false)
  status       JobStatus     @default(OPEN)
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([companyId])
  @@index([status])
}

model Application {
  id        String               @id @default(uuid())
  jobId     String
  job       JobVacancy           @relation(fields: [jobId], references: [id], onDelete: Cascade)
  seekerId  String
  seeker    User                 @relation("SeekerApplications", fields: [seekerId], references: [id], onDelete: Cascade)
  coverNote String?              @db.Text
  resumeUrl String?
  status    ApplicationStatus    @default(APPLIED)
  history   ApplicationHistory[]
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  @@unique([jobId, seekerId]) // Strict single-application rule enforced at DB engine level
  @@index([jobId])
  @@index([seekerId])
}

model ApplicationHistory {
  id             String             @id @default(uuid())
  applicationId  String
  application    Application        @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  previousStatus ApplicationStatus?
  newStatus      ApplicationStatus
  changedById    String
  changedBy      User               @relation("ChangedByUser", fields: [changedById], references: [id])
  note           String?            @db.Text
  createdAt      DateTime           @default(now())

  @@index([applicationId])
}
```

#### 4.2. Atomic Transaction Guarantees
1. **Application Creation Transaction**:
   ```typescript
   await prisma.$transaction(async (tx) => {
     const app = await tx.application.create({
       data: { jobId, seekerId, coverNote, resumeUrl, status: 'APPLIED' }
     });
     await tx.applicationHistory.create({
       data: {
         applicationId: app.id,
         previousStatus: null,
         newStatus: 'APPLIED',
         changedById: seekerId,
         note: 'Application submitted'
       }
     });
     return app;
   });
   ```
2. **Status Update Transaction**:
   ```typescript
   await prisma.$transaction(async (tx) => {
     const updated = await tx.application.update({
       where: { id: applicationId },
       data: { status: newStatus }
     });
     await tx.applicationHistory.create({
       data: {
         applicationId,
         previousStatus: currentApplication.status,
         newStatus,
         changedById: recruiterId,
         note
       }
     });
     return updated;
   });
   ```

---

### 5. Authentication & Authorization Strategy

#### 5.1. Authentication Strategy
1. **Password Hashing**: Passwords hashed with `bcryptjs` (salt rounds: 10).
2. **Token Issuance**: JWT signed with `JWT_SECRET` (payload: `{ userId, email, role, companyProfileId? }`, expiry: 24h).
3. **HTTP-Only Cookie Storage**:
   ```typescript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   });
   ```
4. **Session Hydration (`GET /api/auth/me`)**:
   - Client sends credentials on startup.
   - Server reads `req.cookies.token`, decodes user identity, fetches fresh user & company profile from DB, and returns user details.
5. **Logout (`POST /api/auth/logout`)**:
   - Server invokes `res.clearCookie('token')`.

#### 5.2. Strict Authorization & Ownership Strategy
1. **Role Enforcement**: Middleware checks `req.user.role`. Non-matching roles receive `403 Forbidden`.
2. **Company Ownership Enforcement**:
   - **Job Candidates**: When `GET /api/company/jobs/:jobId/candidates` is called, verify `job.companyId === req.user.companyProfileId`. If mismatch -> `403 Forbidden`.
   - **Status Update**: When `PATCH /api/company/applications/:id/status` is called, fetch application joined with `job`. Verify `application.job.companyId === req.user.companyProfileId`. If mismatch -> `403 Forbidden`.
   - **Audit History**: When `GET /api/company/applications/:id/history` is called, verify company owns the application's job. If mismatch -> `403 Forbidden`.

---

### 6. API Structure & Response Formatting

All endpoints return uniform response shapes:

#### Success Response
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "You have already applied for this job vacancy",
    "details": null
  }
}
```

---

### 7. Error Handling & Validation Strategy

1. **Custom `AppError` Hierarchy**:
   - `BadRequestError (400)`
   - `UnauthorizedError (401)`
   - `ForbiddenError (403)`
   - `NotFoundError (404)`
   - `ConflictError (409)`
2. **Zod Validation Pipeline**:
   - Schema validation executes before controller logic.
   - Validation issues return `400 Bad Request` with structured field paths and error messages.
3. **Database Unique Constraint Catch**:
   - Prisma code `P2002` (unique constraint violation on `[jobId, seekerId]`) is intercepted by error middleware and cleanly mapped to `409 Conflict` (`DUPLICATE_APPLICATION`).

---

### 8. Security Considerations

- **HTTP-Only Cookies**: Prevents client-side scripts from reading session tokens.
- **CORS Configuration**: Restricts origins (`origin: 'http://localhost:5173', credentials: true`).
- **Helmet**: Applies defensive HTTP security headers.
- **Sanitized Responses**: Passwords (`passwordHash`) are never selected in Prisma queries or serialized in responses.

---

### 9. Deployment Strategy

- **Phase 1: Local Development & Verification**:
  - PostgreSQL running locally (`localhost:5432`).
  - Backend running on `http://localhost:5000`.
  - Frontend running on `http://localhost:5173`.
- **Phase 2: Production Packaging**:
  - Backend compiles to vanilla JavaScript via `tsc`.
  - Frontend compiles to optimized SPA bundle via `vite build`.
  - Deployment configuration (Docker / Cloud Run / VPS) is finalized only after local E2E verification is 100% complete.
