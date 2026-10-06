# IndoKerja.id - REST API Specification

Comprehensive documentation for all REST API endpoints implemented in the IndoKerja.id Job Application Management System.

---

## 1. Overview & Architectural Conventions

- **Base URL**: `http://localhost:5000/api` (proxied via Vite frontend at `/api`)
- **Transport**: JSON (`Content-Type: application/json; charset=utf-8`)
- **Authentication**: Stateless JWT stored inside an `HttpOnly`, `SameSite=Lax` cookie named `token`. Client requests must include `credentials: 'include'`.
- **Stateless Authorization**: Role-based access control (`JOB_SEEKER` and `COMPANY`).

### Uniform Success Response Envelope
```json
{
  "success": true,
  "message": "Human-readable status summary",
  "data": { ... }
}
```

### Uniform Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "STANDARD_ERROR_CODE",
    "message": "User-friendly error explanation",
    "details": null
  }
}
```

### HTTP Status Codes
| Code | Meaning | Typical Usage |
| :--- | :--- | :--- |
| `200 OK` | Read or update succeeded | `GET /api/jobs`, `PATCH .../status` |
| `201 Created` | Resource created | `POST .../register`, `POST .../apply` |
| `400 Bad Request` | Payload validation failure / illegal transition | Zod errors, invalid lifecycle moves |
| `401 Unauthorized` | Missing, invalid, or expired session cookie | Accessing protected route without login |
| `403 Forbidden` | Valid session, but wrong role or not resource owner | Seeker posting job, cross-tenant access |
| `404 Not Found` | Target resource does not exist | Invalid vacancy ID or application ID |
| `409 Conflict` | State conflict / duplication rule violation | Duplicate email, duplicate job application |
| `500 Server Error` | Unhandled runtime exception | Database or internal server failure |

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register User
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Auth**: None (Public)
- **Role**: Any
- **Purpose**: Registers a new `JOB_SEEKER` or `COMPANY` account. When `role === "COMPANY"`, atomically creates a `CompanyProfile` inside a database transaction. Sets the session cookie upon success.

#### Request Body
```json
{
  "fullName": "Budi Santoso",
  "email": "seeker@indokerja.id",
  "password": "Password123!",
  "phone": "081311223344",
  "role": "JOB_SEEKER"
}
```
*Company Registration (Additional fields):*
```json
{
  "fullName": "Recruiter PT Tech",
  "email": "company@indokerja.id",
  "password": "Password123!",
  "phone": "081234567890",
  "role": "COMPANY",
  "companyName": "PT Teknologi Nusantara",
  "industry": "Teknologi Informasi",
  "location": "Jakarta Selatan",
  "description": "Perusahaan teknologi pengembang platform digital",
  "website": "https://teknologinusantara.id"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
      "email": "seeker@indokerja.id",
      "fullName": "Budi Santoso",
      "phone": "081311223344",
      "role": "JOB_SEEKER",
      "companyProfile": null,
      "createdAt": "2026-10-06T13:28:42.546Z"
    }
  }
}
```

#### Error Response (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email is already registered",
    "details": null
  }
}
```

---

### 2.2 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth**: None (Public)
- **Role**: Any
- **Purpose**: Authenticates user credentials via `bcryptjs`, issues a signed JWT, and attaches it as an `HttpOnly` cookie.

#### Request Body
```json
{
  "email": "seeker@indokerja.id",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
*(Includes header: `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`)*
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
      "email": "seeker@indokerja.id",
      "fullName": "Budi Santoso",
      "phone": "081311223344",
      "role": "JOB_SEEKER",
      "companyProfile": null,
      "createdAt": "2026-10-06T13:28:42.546Z"
    }
  }
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

---

### 2.3 Get Current Session (`/me`)
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Auth**: Required (`HttpOnly` cookie)
- **Role**: `JOB_SEEKER` or `COMPANY`
- **Purpose**: Hydrates the active user session during application startup or page reload.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "User session retrieved",
  "data": {
    "user": {
      "id": "0e27475d-d806-4723-ad26-a71286785578",
      "email": "company@indokerja.id",
      "fullName": "Recruiter PT Teknologi Nusantara",
      "phone": "081234567890",
      "role": "COMPANY",
      "companyProfile": {
        "id": "ec771687-273e-43f2-85e3-4160efeb74db",
        "companyName": "PT Teknologi Nusantara",
        "industry": "Teknologi Informasi & Software",
        "location": "Jakarta Selatan",
        "description": "Perusahaan teknologi inovatif...",
        "website": "https://teknologinusantara.id"
      },
      "createdAt": "2026-10-06T13:28:42.537Z"
    }
  }
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": null
  }
}
```

---

### 2.4 Logout
- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Auth**: None / Optional
- **Role**: Any
- **Purpose**: Clears the session cookie on the client.

#### Success Response (`200 OK`)
*(Includes header: `Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)*
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## 3. Public Job Endpoints (`/api/jobs`)

### 3.1 Browse Public Jobs
- **Method**: `GET`
- **URL**: `/api/jobs`
- **Auth**: None (Public)
- **Role**: Any
- **Query Parameters**:
  - `keyword` *(optional)*: Case-insensitive search on title and description.
  - `jobType` *(optional)*: One of `FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE`.
  - `location` *(optional)*: Case-insensitive filter on location.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job vacancies retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
        "title": "Senior Frontend Engineer (React)",
        "location": "Jakarta Selatan (Hybrid)",
        "jobType": "FULL_TIME",
        "salaryMin": 18000000,
        "salaryMax": 25000000,
        "isNegotiable": false,
        "status": "OPEN",
        "createdAt": "2026-10-06T13:28:42.553Z",
        "company": {
          "id": "ec771687-273e-43f2-85e3-4160efeb74db",
          "companyName": "PT Teknologi Nusantara",
          "industry": "Teknologi Informasi & Software",
          "location": "Jakarta Selatan"
        }
      }
    ]
  }
}
```

---

### 3.2 Get Job Detail
- **Method**: `GET`
- **URL**: `/api/jobs/:id`
- **Auth**: Optional (Public, but user context inspected if cookie present)
- **Role**: Any
- **Purpose**: Returns complete vacancy description, requirements, company info, and reflects caller's application state (`hasApplied`, `userApplicationStatus`).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job vacancy retrieved successfully",
  "data": {
    "job": {
      "id": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
      "companyId": "ec771687-273e-43f2-85e3-4160efeb74db",
      "title": "Senior Frontend Engineer (React)",
      "description": "Kami mencari Senior Frontend Engineer berpengalaman...",
      "requirements": "- Pengalaman minimal 3 tahun dengan React & TypeScript...",
      "location": "Jakarta Selatan (Hybrid)",
      "jobType": "FULL_TIME",
      "salaryMin": 18000000,
      "salaryMax": 25000000,
      "isNegotiable": false,
      "status": "OPEN",
      "createdAt": "2026-10-06T13:28:42.553Z",
      "company": {
        "id": "ec771687-273e-43f2-85e3-4160efeb74db",
        "companyName": "PT Teknologi Nusantara",
        "industry": "Teknologi Informasi & Software",
        "location": "Jakarta Selatan",
        "description": "Perusahaan teknologi inovatif...",
        "website": "https://teknologinusantara.id"
      },
      "hasApplied": true,
      "userApplicationStatus": "SHORTLISTED"
    }
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job vacancy not found",
    "details": null
  }
}
```

---

## 4. Job Seeker Application Endpoints (`/api/applications`)

### 4.1 Apply for a Job
- **Method**: `POST`
- **URL**: `/api/applications/apply`
- **Auth**: Required
- **Role**: `JOB_SEEKER` only
- **Purpose**: Submits a job application for the authenticated seeker. Atomically inserts `Application` (`status: APPLIED`) and initial `ApplicationHistory` log within a Prisma transaction. Enforces single-application per vacancy.

#### Request Body
```json
{
  "jobId": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
  "coverNote": "Saya memiliki pengalaman 4 tahun membangun web apps dengan React.",
  "resumeUrl": "https://linkedin.com/in/budisantoso"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "id": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
      "jobId": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
      "seekerId": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
      "coverNote": "Saya memiliki pengalaman 4 tahun membangun web apps...",
      "resumeUrl": "https://linkedin.com/in/budisantoso",
      "status": "APPLIED",
      "createdAt": "2026-10-06T14:15:30.123Z",
      "updatedAt": "2026-10-06T14:15:30.123Z",
      "job": {
        "id": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
        "title": "Senior Frontend Engineer (React)",
        "company": {
          "companyName": "PT Teknologi Nusantara"
        }
      }
    }
  }
}
```

#### Error Response (`409 Conflict`)
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

### 4.2 List My Applications
- **Method**: `GET`
- **URL**: `/api/applications/my-applications`
- **Auth**: Required
- **Role**: `JOB_SEEKER` only
- **Purpose**: Returns all applications submitted by the caller with vacancy and company metadata.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
        "status": "SHORTLISTED",
        "createdAt": "2026-10-06T13:28:42.562Z",
        "job": {
          "id": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
          "title": "Senior Frontend Engineer (React)",
          "location": "Jakarta Selatan (Hybrid)",
          "jobType": "FULL_TIME",
          "company": {
            "id": "ec771687-273e-43f2-85e3-4160efeb74db",
            "companyName": "PT Teknologi Nusantara",
            "location": "Jakarta Selatan"
          }
        }
      }
    ]
  }
}
```

---

### 4.3 Get Application Detail & Audit History
- **Method**: `GET`
- **URL**: `/api/applications/:id`
- **Auth**: Required
- **Role**: `JOB_SEEKER` only
- **Purpose**: Returns application metadata, submitted cover note/portfolio, and full chronological history audit trail. Caller must be the seeker who submitted the application.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Application details retrieved successfully",
  "data": {
    "application": {
      "id": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
      "jobId": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
      "seekerId": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
      "coverNote": "Saya memiliki pengalaman...",
      "resumeUrl": "https://linkedin.com/in/budisantoso",
      "status": "SHORTLISTED",
      "createdAt": "2026-10-06T13:28:42.562Z",
      "job": {
        "title": "Senior Frontend Engineer (React)",
        "location": "Jakarta Selatan (Hybrid)",
        "jobType": "FULL_TIME",
        "company": {
          "companyName": "PT Teknologi Nusantara",
          "location": "Jakarta Selatan"
        }
      },
      "history": [
        {
          "id": "hist-1",
          "previousStatus": null,
          "newStatus": "APPLIED",
          "note": "Berkas lamaran awal dikirimkan oleh pelamar.",
          "createdAt": "2026-10-03T13:28:42.562Z",
          "changedBy": {
            "id": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
            "fullName": "Budi Santoso",
            "role": "JOB_SEEKER"
          }
        },
        {
          "id": "hist-2",
          "previousStatus": "APPLIED",
          "newStatus": "REVIEWING",
          "note": "Profil kandidat sedang ditinjau oleh HR.",
          "createdAt": "2026-10-04T13:28:42.562Z",
          "changedBy": {
            "id": "0e27475d-d806-4723-ad26-a71286785578",
            "fullName": "Recruiter PT Teknologi Nusantara",
            "role": "COMPANY"
          }
        },
        {
          "id": "hist-3",
          "previousStatus": "REVIEWING",
          "newStatus": "SHORTLISTED",
          "note": "Kandidat masuk shortlist interview.",
          "createdAt": "2026-10-05T13:28:42.562Z",
          "changedBy": {
            "id": "0e27475d-d806-4723-ad26-a71286785578",
            "fullName": "Recruiter PT Teknologi Nusantara",
            "role": "COMPANY"
          }
        }
      ]
    }
  }
}
```

#### Error Response (`403 Forbidden`)
*(Returned when Seeker B attempts to view Seeker A's application)*
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_RESOURCE",
    "message": "You do not have permission to view this application",
    "details": null
  }
}
```

---

## 5. Company Management Endpoints (`/api/company`)

### 5.1 Post New Job Vacancy
- **Method**: `POST`
- **URL**: `/api/company/jobs`
- **Auth**: Required
- **Role**: `COMPANY` only
- **Purpose**: Creates an active vacancy bound to the caller's `companyProfileId`.

#### Request Body
```json
{
  "title": "Lead DevOps Engineer",
  "description": "Mengelola infrastruktur cloud Kubernetes dan CI/CD pipeline.",
  "requirements": "Minimal 4 tahun pengalaman dengan AWS/GCP, Docker, Terraform.",
  "location": "Jakarta Selatan (Hybrid)",
  "jobType": "FULL_TIME",
  "salaryMin": 22000000,
  "salaryMax": 30000000,
  "isNegotiable": false
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Job vacancy created successfully",
  "data": {
    "job": {
      "id": "9812df90-128a-4938-9201-11823901ba12",
      "companyId": "ec771687-273e-43f2-85e3-4160efeb74db",
      "title": "Lead DevOps Engineer",
      "status": "OPEN",
      "createdAt": "2026-10-06T18:09:25.000Z"
    }
  }
}
```

---

### 5.2 List Company Vacancies
- **Method**: `GET`
- **URL**: `/api/company/my-jobs`
- **Auth**: Required
- **Role**: `COMPANY` only
- **Purpose**: Returns all vacancies created by the caller's company along with aggregate `applicantCount`.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Company jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "18f9c049-9f70-4fc7-bf84-7a1a4fe8ad72",
        "companyId": "ec771687-273e-43f2-85e3-4160efeb74db",
        "title": "Senior Frontend Engineer (React)",
        "location": "Jakarta Selatan (Hybrid)",
        "jobType": "FULL_TIME",
        "salaryMin": 18000000,
        "salaryMax": 25000000,
        "isNegotiable": false,
        "status": "OPEN",
        "applicantCount": 1,
        "createdAt": "2026-10-06T13:28:42.553Z"
      }
    ]
  }
}
```

---

### 5.3 Get Candidates for Vacancy
- **Method**: `GET`
- **URL**: `/api/company/jobs/:jobId/candidates`
- **Auth**: Required
- **Role**: `COMPANY` only
- **Purpose**: Returns all candidate applications submitted for the specified vacancy. Strictly verifies company ownership of the parent job.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Candidates retrieved successfully",
  "data": {
    "candidates": [
      {
        "id": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
        "status": "SHORTLISTED",
        "coverNote": "Saya memiliki pengalaman 4 tahun...",
        "resumeUrl": "https://linkedin.com/in/budisantoso",
        "createdAt": "2026-10-06T13:28:42.562Z",
        "updatedAt": "2026-10-06T13:28:42.562Z",
        "seeker": {
          "id": "f364ad95-5055-4bb7-8ed5-6e52ee4eaaad",
          "fullName": "Budi Santoso",
          "email": "seeker@indokerja.id",
          "phone": "081311223344"
        }
      }
    ]
  }
}
```

#### Error Response (`403 Forbidden`)
*(Returned when Company B attempts to view candidates on a vacancy owned by Company A)*
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_RESOURCE",
    "message": "You do not have permission to view or manage candidates for this job",
    "details": null
  }
}
```

---

### 5.4 Update Candidate Status
- **Method**: `PATCH`
- **URL**: `/api/company/applications/:id/status`
- **Auth**: Required
- **Role**: `COMPANY` only
- **Purpose**: Atomically transitions candidate status inside a database transaction and logs a new `ApplicationHistory` entry. Enforces the strict unidirectional lifecycle state machine. Verifies caller owns the application's parent vacancy.

#### Valid Lifecycle Transitions
- `APPLIED` ➔ `REVIEWING`
- `REVIEWING` ➔ `SHORTLISTED` or `REJECTED`
- `SHORTLISTED` ➔ `ACCEPTED` or `REJECTED`
- `ACCEPTED` ➔ *(Terminal state, no further transitions)*
- `REJECTED` ➔ *(Terminal state, no further transitions)*

#### Request Body
```json
{
  "status": "SHORTLISTED",
  "note": "Kandidat lolos seleksi berkas, dijadwalkan interview teknis."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Candidate status updated successfully",
  "data": {
    "application": {
      "id": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
      "status": "SHORTLISTED",
      "updatedAt": "2026-10-06T18:10:28.123Z"
    }
  }
}
```

#### Error Response (`400 Bad Request`)
*(Returned when attempting an illegal transition, e.g., `SHORTLISTED` ➔ `APPLIED` or mutating terminal `ACCEPTED`)*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Invalid status transition from SHORTLISTED to APPLIED",
    "details": null
  }
}
```

---

### 5.5 Get Candidate Application History
- **Method**: `GET`
- **URL**: `/api/company/applications/:id/history`
- **Auth**: Required
- **Role**: `COMPANY` only
- **Purpose**: Returns the read-only audit trail for a candidate's application. Strictly verifies caller owns the vacancy.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Application history retrieved successfully",
  "data": {
    "history": [
      {
        "id": "hist-1",
        "applicationId": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
        "previousStatus": null,
        "newStatus": "APPLIED",
        "changedById": "seeker-id",
        "note": "Berkas lamaran awal dikirimkan oleh pelamar.",
        "createdAt": "2026-10-03T13:28:42.562Z",
        "changedBy": {
          "id": "seeker-id",
          "fullName": "Budi Santoso",
          "role": "JOB_SEEKER"
        }
      },
      {
        "id": "hist-2",
        "applicationId": "c1f71df8-3d84-4fe1-ba55-ea224d06a928",
        "previousStatus": "APPLIED",
        "newStatus": "REVIEWING",
        "changedById": "recruiter-id",
        "note": "CV dan portofolio sedang ditinjau.",
        "createdAt": "2026-10-04T13:28:42.562Z",
        "changedBy": {
          "id": "recruiter-id",
          "fullName": "Recruiter PT Teknologi Nusantara",
          "role": "COMPANY"
        }
      }
    ]
  }
}
```
