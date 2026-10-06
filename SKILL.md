# Technical Skills & Implementation Constraints (SKILL.md)
## Project: IndoKerja.id - Job Application Management System

---

### 1. Required Technical Skills & Competencies

To successfully build, maintain, and evaluate the IndoKerja.id application within the technical assessment parameters, the engineering workflow demands mastery of the following competencies:

#### 1.1. Backend Engineering (Node.js + TypeScript + Express.js)
- **RESTful API Design & HTTP Semantics**:
  - Semantic usage of HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
  - Accurate status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
  - Standardized JSON response formatting.
- **Security & Cookie-Based Authentication**:
  - Stateless JSON Web Token (JWT) lifecycle.
  - HTTP-only cookie transport (`cookie-parser`, `SameSite=Lax`, `httpOnly: true`) eliminating client-side XSS token theft.
  - Cryptographic password hashing via `bcryptjs` with >= 10 salt rounds.
  - Role-based middleware enforcement (`JOB_SEEKER` vs `COMPANY`).
  - Strict resource ownership validation: verifying caller company owns target jobs/candidates before permitting reads or mutations.
- **Relational Integrity & Prisma Transactions**:
  - Relational schema modeling in PostgreSQL.
  - Strict database constraints: `@@unique([jobId, seekerId])` preventing duplicate applications at the database engine level.
  - Atomic transactions (`prisma.$transaction`) guaranteeing that:
    1. Application creation always inserts an initial `ApplicationHistory` record atomically.
    2. Candidate status updates always insert a new `ApplicationHistory` audit record atomically.
- **Validation & Error Handling**:
  - Schema-first validation using `zod` for request bodies, parameters, and queries.
  - Centralized, structured error middleware intercepting Prisma errors (e.g. `P2002` mapped to `409 Conflict`) and preventing unhandled promise rejections.

#### 1.2. Frontend Engineering (React.js + TypeScript + Vite)
- **Modern Component Architecture**:
  - Clean separation of presentation components, container components, and layout views.
  - Strict TypeScript interfaces for component props, state, and shared DTOs.
- **Client Routing & Route Guards**:
  - Client-side routing with `react-router-dom` v6.
  - Protected route wrappers enforcing authentication and authorization (role-based redirection).
- **Session Hydration & Transport**:
  - Global authentication context (`AuthContext`) calling `/api/auth/me` on startup to restore session state from the HTTP-only cookie.
  - Native fetch or Axios client configured with `credentials: 'include'` (or `withCredentials: true`).
- **Aesthetic Vanilla CSS & Responsive Web Design**:
  - CSS Custom Properties (variables) for consistent themes, typography, and spacing.
  - Responsive flex and grid layouts across mobile (375px), tablet (768px), and desktop (1280px+).
  - Micro-interactions, status badges, timelines, and accessible dialogs without heavy external component libraries.

---

### 2. Implementation Constraints & Guardrails

| Category | Constraint | Rationale |
| :--- | :--- | :--- |
| **Framework Scope** | Express.js over NestJS | Express offers minimal overhead, rapid setup, and explicit architectural transparency without excessive decorators or module overhead. |
| **Authentication Transport** | HTTP-Only Cookie | Eliminates localStorage token theft vulnerabilities; seamlessly hydrated via `/api/auth/me`. |
| **Styling Scope** | Vanilla CSS (CSS Variables) | Full aesthetic control, zero build-time styling conflicts, no bulky framework dependencies, compliant with project design aesthetic guidelines. |
| **Database** | PostgreSQL + Prisma ORM | Relational constraints (such as `@@unique([jobId, seekerId])`) guarantee data integrity at the database engine level. |
| **State Scope** | React Context (No Redux/Zustand) | The state footprint consists primarily of authentication and local page data; adding Redux or Zustand introduces unnecessary boilerplate. |
| **Audit Integrity** | Mandatory `prisma.$transaction` | Prevents orphaned application statuses without corresponding history records. |
| **Dependencies** | Minimalist Package Footprint | Zero unneeded dependencies (no `lodash`, no heavy component kits, no complex utility abstractions). |
| **Deployment Scope** | Local Verification First | Full end-to-end verification and testing must precede any packaging or deployment configurations. |
