# IEM-UEM Admission System
## Backend Architecture Reference

**Version:** 1.0  
**Architecture:** Layered REST API  
**Backend:** Node.js + Express.js  
**Databases:** MySQL + MongoDB  
**Frontend:** React + Vite

---

# 1. Purpose

This document defines the backend architecture of the IEM-UEM Admission System.

The architecture is designed to support:

- Student registration and authentication
- Administrator authentication
- Student profiles
- Admission applications
- Academic information
- Course preferences
- Document management
- Application status tracking
- Administrator application review
- Application approval/rejection
- Audit logging
- Future payment, merit, seat allocation, and admission-confirmation modules

The backend uses **two databases intentionally**:

- **MySQL** for structured relational data and identity/access management.
- **MongoDB** for flexible, document-oriented admission application data.

---

# 2. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │      React Frontend     │
                         │                         │
                         │  Student Portal         │
                         │  Admin Portal           │
                         └────────────┬────────────┘
                                      │
                                HTTP / REST
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │       Node.js + Express         │
                    │                                 │
                    │  ┌───────────────────────────┐  │
                    │  │ Routes                    │  │
                    │  └─────────────┬─────────────┘  │
                    │                ▼                │
                    │  ┌───────────────────────────┐  │
                    │  │ Middleware                │  │
                    │  │ Auth / Role / Validation  │  │
                    │  └─────────────┬─────────────┘  │
                    │                ▼                │
                    │  ┌───────────────────────────┐  │
                    │  │ Controllers               │  │
                    │  └─────────────┬─────────────┘  │
                    │                ▼                │
                    │  ┌───────────────────────────┐  │
                    │  │ Services                  │  │
                    │  │ Business Logic            │  │
                    │  └───────┬───────────┬───────┘  │
                    └──────────┼───────────┼──────────┘
                               │           │
                         ┌─────▼─────┐ ┌──▼──────────┐
                         │   MySQL   │ │  MongoDB    │
                         │           │ │             │
                         │ Users     │ │ Applications│
                         │ Roles     │ │ Documents   │
                         │ Auth      │ │ Audit Logs  │
                         │ Courses   │ │             │
                         └───────────┘ └─────────────┘
```

---

# 3. Architectural Principles

The backend follows these principles.

## 3.1 Separation of Responsibilities

Each layer has a specific responsibility.

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Data Access / Models
  ↓
Database
```

A controller should not contain large amounts of business logic.

For example, instead of:

```text
Controller
 ├── validate application
 ├── check status
 ├── update MongoDB
 ├── create audit record
 └── send response
```

prefer:

```text
Controller
     ↓
Application Service
     ├── validation
     ├── business rules
     ├── database operations
     └── audit operation
```

---

# 4. Technology Stack

## Backend

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| API style | REST |
| Authentication | JWT |
| Password hashing | bcrypt |
| Validation | Joi / Zod |
| Environment configuration | dotenv |

## Databases

| Database | Primary Responsibility |
|---|---|
| MySQL | Identity, authentication, roles, structured master data |
| MongoDB | Admission applications, document metadata, audit logs |

## Frontend

| Component | Technology |
|---|---|
| UI | React |
| Build tool | Vite |
| Communication | REST API |
| Authentication state | JWT/session mechanism |

---

# 5. Database Strategy

The system deliberately uses **polyglot persistence**.

This means different types of data are stored in the database best suited to that data.

---

## 5.1 MySQL

MySQL is the source of truth for structured relational entities.

### Primary entities

```text
users
roles
courses
departments
admission_cycles
```

The initial implementation can start with:

```text
users
```

and add the other tables as admission functionality grows.

---

## 5.2 MongoDB

MongoDB stores flexible admission-domain documents.

### Collections

```text
applications
documents
audit_logs
```

Potential future collections:

```text
payments
notifications
merit_records
```

---

# 6. Data Ownership

A major architectural rule is:

> Every piece of data should have one authoritative owner.

### Ownership model

```text
MySQL
│
├── User identity
├── Email
├── Password hash
├── Role
├── Account status
└── Course master data
       
MongoDB
│
├── Application
├── Academic details
├── Personal application data
├── Course preferences
├── Documents metadata
├── Application status
└── Audit logs
```

The two databases should **not duplicate entire records**.

---

# 7. Relationship Between MySQL and MongoDB

MongoDB documents reference MySQL users using the MySQL user ID.

Example:

```text
MySQL
────────────────────
users
────────────────────
id = 1024
name = Student Name
email = student@email.com
role = STUDENT
```

MongoDB:

```json
{
  "applicationId": "IEM2026000123",
  "userId": 1024,
  "status": "SUBMITTED"
}
```

The `userId` is the logical connection between the two databases.

---

# 8. MySQL Data Model

## 8.1 Users

```text
users
────────────────────────────
id                  PK
name
email               UNIQUE
mobile
password_hash
role
is_active
created_at
updated_at
```

### Role values

```text
STUDENT
ADMIN
```

Future roles can be introduced if required.

---

## 8.2 Courses

A course/catalog entity is relational because courses are shared master data.

```text
courses
────────────────────────────
id                  PK
course_code         UNIQUE
course_name
department
degree
duration
is_active
created_at
updated_at
```

Applications should reference the course ID rather than duplicate course information.

---

# 9. MongoDB Data Model

## 9.1 Applications

Example:

```json
{
  "_id": "...",
  "applicationId": "IEM2026000123",
  "userId": 1024,

  "personalDetails": {
    "fullName": "Student Name",
    "dateOfBirth": "2006-01-01",
    "gender": "MALE",
    "category": "GENERAL"
  },

  "contactDetails": {
    "email": "student@email.com",
    "phone": "9876543210",
    "address": {
      "street": "...",
      "city": "...",
      "state": "...",
      "postalCode": "..."
    }
  },

  "academicDetails": {
    "class10": {
      "board": "...",
      "percentage": 92.4
    },
    "class12": {
      "board": "...",
      "percentage": 94.2
    }
  },

  "coursePreferences": [
    {
      "courseId": 101,
      "preference": 1
    },
    {
      "courseId": 102,
      "preference": 2
    }
  ],

  "status": "DRAFT",

  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# 10. Document Management

Actual files should not be embedded directly inside application documents.

Instead:

```text
Application
     │
     └── documents
            │
            ├── Class 10 Marksheet
            ├── Class 12 Marksheet
            ├── Photograph
            └── Identity Proof
```

MongoDB stores metadata:

```json
{
  "applicationId": "IEM2026000123",
  "type": "CLASS_12_MARKSHEET",
  "fileName": "marksheet.pdf",
  "fileUrl": "...",
  "verificationStatus": "PENDING",
  "uploadedAt": "..."
}
```

The physical file can later be stored in:

```text
AWS S3
```

or another object-storage service.

For the initial prototype, local storage can be used.

---

# 11. Audit Logging

Administrative actions should be recorded.

Example:

```json
{
  "applicationId": "IEM2026000123",
  "adminId": 1,
  "action": "APPLICATION_APPROVED",
  "previousStatus": "UNDER_REVIEW",
  "newStatus": "APPROVED",
  "remarks": "Documents verified",
  "timestamp": "..."
}
```

This provides traceability.

Important administrative actions include:

```text
APPLICATION_REVIEWED
APPLICATION_APPROVED
APPLICATION_REJECTED
DOCUMENT_VERIFIED
DOCUMENT_REJECTED
STATUS_CHANGED
```

---

# 12. Backend Directory Structure

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── mysql.js
│   │   └── mongodb.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── application.controller.js
│   │   ├── document.controller.js
│   │   └── admin.controller.js
│   │
│   ├── models/
│   │   │
│   │   ├── mysql/
│   │   │   ├── User.js
│   │   │   └── Course.js
│   │   │
│   │   └── mongodb/
│   │       ├── Application.js
│   │       ├── Document.js
│   │       └── AuditLog.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── application.routes.js
│   │   ├── document.routes.js
│   │   └── admin.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── application.service.js
│   │   ├── document.service.js
│   │   └── audit.service.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── application.validator.js
│   │   └── document.validator.js
│   │
│   ├── utils/
│   │   ├── generateApplicationId.js
│   │   └── errors.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 13. Request Processing Flow

A typical request follows:

```text
HTTP Request
     │
     ▼
Express Router
     │
     ▼
Authentication Middleware
     │
     ▼
Authorization Middleware
     │
     ▼
Validation Middleware
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Model / Database
     │
     ▼
Service
     │
     ▼
Controller
     │
     ▼
HTTP Response
```

---

# 14. Authentication Architecture

Authentication uses JWT.

### Login

```text
Student
   │
   │ email + password
   ▼
POST /api/auth/login
   │
   ▼
Auth Controller
   │
   ▼
Auth Service
   │
   ▼
MySQL users
   │
   ├── Find user
   ├── Verify password
   └── Verify account
   │
   ▼
Generate JWT
   │
   ▼
Response
```

The token contains minimal identity information:

```json
{
  "userId": 1024,
  "role": "STUDENT"
}
```

Sensitive information such as passwords must never be placed in the JWT.

---

# 15. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Example:

```text
JWT
 ↓
Authentication Middleware
 ↓
role = ADMIN
 ↓
Admin Route
```

Student:

```text
GET /api/student/application
```

Allowed:

```text
STUDENT
```

Admin:

```text
GET /api/admin/applications
```

Allowed:

```text
ADMIN
```

---

# 16. API Architecture

All APIs should use a common prefix:

```text
/api
```

---

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/admin/login
GET  /api/auth/me
POST /api/auth/logout
```

---

## Student

```http
GET  /api/student/profile
PUT  /api/student/profile

GET  /api/student/application
POST /api/student/application
PUT  /api/student/application
POST /api/student/application/submit

GET  /api/student/documents
POST /api/student/documents

GET  /api/student/status
```

---

## Admin

```http
GET  /api/admin/dashboard

GET  /api/admin/applications
GET  /api/admin/applications/:id

PUT  /api/admin/applications/:id/status

POST /api/admin/applications/:id/approve
POST /api/admin/applications/:id/reject

GET  /api/admin/applications/:id/documents
PUT  /api/admin/documents/:id/verify
```

---

# 17. Application Lifecycle

The application lifecycle should be controlled by the backend.

Initial workflow:

```text
              ┌──────────┐
              │  DRAFT   │
              └────┬─────┘
                   │
                   │ Submit
                   ▼
             ┌───────────┐
             │ SUBMITTED │
             └─────┬─────┘
                   │
                   │ Review
                   ▼
           ┌───────────────┐
           │ UNDER_REVIEW  │
           └───────┬───────┘
                   │
            ┌──────┴──────┐
            │             │
            ▼             ▼
      ┌──────────┐   ┌──────────┐
      │ APPROVED │   │ REJECTED │
      └──────────┘   └──────────┘
```

The backend should validate every transition.

For example:

```text
DRAFT → SUBMITTED                 VALID
SUBMITTED → UNDER_REVIEW          VALID
UNDER_REVIEW → APPROVED           VALID
UNDER_REVIEW → REJECTED           VALID

DRAFT → APPROVED                  INVALID
REJECTED → APPROVED               INVALID
```

---

# 18. Student Application Flow

```text
Student Login
     │
     ▼
Student Dashboard
     │
     ▼
Create Application
     │
     ▼
Save Draft
     │
     ├── Personal Details
     ├── Contact Details
     ├── Academic Details
     ├── Course Preferences
     └── Documents
     │
     ▼
Submit Application
     │
     ▼
Backend Validation
     │
     ▼
SUBMITTED
     │
     ▼
Student Status Page
```

---

# 19. Administrator Flow

```text
Admin Login
     │
     ▼
Admin Dashboard
     │
     ├── Total Applications
     ├── Pending Applications
     ├── Approved
     └── Rejected
     │
     ▼
Applications
     │
     ▼
Application Details
     │
     ├── Student Information
     ├── Academic Information
     ├── Documents
     └── Application History
     │
     ▼
Admin Decision
     │
     ├── Approve
     └── Reject
     │
     ▼
Update Application
     │
     ▼
Create Audit Log
```

---

# 20. Dashboard Data Flow

The Admin Dashboard should not calculate everything in React.

Instead:

```text
GET /api/admin/dashboard
              │
              ▼
        Admin Controller
              │
              ▼
        Admin Service
              │
       ┌──────┴──────┐
       ▼             ▼
    MongoDB        MySQL
       │
       ▼
Aggregate statistics
       │
       ▼
JSON response
```

Example:

```json
{
  "totalApplications": 1250,
  "submitted": 420,
  "underReview": 180,
  "approved": 560,
  "rejected": 90
}
```

---

# 21. Error Handling

All APIs should return a consistent response format.

### Success

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "IEM2026000123"
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Application cannot be submitted",
  "error": {
    "code": "APPLICATION_INCOMPLETE",
    "details": [
      "Class 12 marksheet is missing"
    ]
  }
}
```

HTTP status codes should be meaningful:

```text
200  Successful request
201  Resource created
400  Invalid request
401  Unauthenticated
403  Unauthorized
404  Resource not found
409  Conflict
422  Validation failure
500  Internal server error
```

---

# 22. Environment Configuration

Credentials must never be hardcoded.

Example:

```env
PORT=5000

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=iem_admission
MYSQL_USER=root
MYSQL_PASSWORD=...

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=iem_admission

JWT_SECRET=...
JWT_EXPIRES_IN=1d
```

`.env` must not be committed to Git.

Provide:

```text
.env.example
```

instead.

---

# 23. Database Connection Strategy

The application should establish both connections during startup.

```text
server.js
    │
    ├── Load environment
    │
    ├── Connect MySQL
    │
    ├── Connect MongoDB
    │
    └── Start Express server
```

If a required database connection fails, the application should not silently start as if everything were working.

---

# 24. Security Requirements

The backend should implement:

### Authentication

- bcrypt password hashing
- JWT authentication
- protected routes

### Authorization

- role-based access control
- student/admin separation

### Input security

- request validation
- sanitization where appropriate
- parameterized SQL queries
- MongoDB query validation

### HTTP security

- CORS configuration
- Helmet
- rate limiting for authentication endpoints

### Secrets

Never expose:

```text
DB passwords
JWT secret
API keys
Cloud credentials
```

to the frontend.

---

# 25. Frontend–Backend Integration

The existing frontend should eventually stop using demo authentication such as:

```js
localStorage.setItem("iem_role", "student");
```

and instead perform:

```text
React
  │
  │ POST /api/auth/login
  ▼
Express
  │
  ▼
MySQL
  │
  ▼
JWT
  │
  ▼
React
```

Then authenticated API calls use the authentication mechanism established by the backend.

---

# 26. Backend-to-Frontend Mapping

Your existing pages map directly to backend resources.

| Frontend Page | Backend API |
|---|---|
| Student Login | `/api/auth/login` |
| Student Register | `/api/auth/register` |
| Student Dashboard | `/api/student/...` |
| Student Profile | `/api/student/profile` |
| Admission Application | `/api/student/application` |
| Student Documents | `/api/student/documents` |
| Student Status | `/api/student/status` |
| Admin Login | `/api/auth/admin/login` |
| Admin Dashboard | `/api/admin/dashboard` |
| Admin Applications | `/api/admin/applications` |
| Admin Application Details | `/api/admin/applications/:id` |

This means the frontend structure you already created is compatible with this architecture.

---

# 27. Recommended Development Sequence

Do not implement all modules simultaneously.

Use the following order:

```text
PHASE 1
Backend Setup
    ↓
Express
    ↓
Environment
    ↓
MySQL Connection
    ↓
MongoDB Connection
    ↓
Health API
```

```text
PHASE 2
Authentication
    ↓
Users
    ↓
Registration
    ↓
Login
    ↓
JWT
    ↓
Role Authorization
```

```text
PHASE 3
Student
    ↓
Profile
    ↓
Application
    ↓
Draft
    ↓
Submission
```

```text
PHASE 4
Documents
    ↓
Upload
    ↓
Metadata
    ↓
Verification
```

```text
PHASE 5
Admin
    ↓
Dashboard
    ↓
Application List
    ↓
Application Details
    ↓
Approve / Reject
```

```text
PHASE 6
Audit
    ↓
Status History
    ↓
Admin Actions
```

```text
PHASE 7
Advanced Admission
    ↓
Payments
    ↓
Eligibility
    ↓
Merit
    ↓
Seat Allocation
    ↓
Admission Confirmation
```

---

# 28. Important Architectural Rule

The frontend should **never be the authority for business rules**.

For example, this is not sufficient:

```text
React:
if (applicationComplete) {
    show "Submit"
}
```

The backend must independently verify:

```text
Is the user authenticated?
       ↓
Does the application belong to this user?
       ↓
Is the application currently DRAFT?
       ↓
Are mandatory fields complete?
       ↓
Are required documents uploaded?
       ↓
Is submission allowed?
       ↓
Update status → SUBMITTED
       ↓
Create audit record
```

The frontend provides the user experience.

The backend enforces the rules.

---

# 29. Target Architecture

The final system should conceptually look like:

```text
                         IEM-UEM
                    Admission System
                           │
              ┌────────────┴────────────┐
              │                         │
         Student Portal            Admin Portal
              │                         │
              └────────────┬────────────┘
                           │
                      REST API
                           │
                 ┌─────────▼─────────┐
                 │   Express API     │
                 │                   │
                 │ Auth              │
                 │ Authorization     │
                 │ Validation        │
                 │ Business Logic    │
                 └───────┬───┬───────┘
                         │   │
              ┌──────────┘   └──────────┐
              ▼                         ▼
        ┌───────────┐             ┌───────────┐
        │   MySQL   │             │  MongoDB  │
        │           │             │           │
        │ Users     │             │ Apps      │
        │ Roles     │             │ Documents │
        │ Courses   │             │ Audit     │
        └───────────┘             └───────────┘
                                         │
                                         ▼
                                  File Storage
```

---

# 30. Key Design Decisions

| Decision | Choice |
|---|---|
| Backend | Node.js + Express |
| API | REST |
| Authentication | JWT |
| Password hashing | bcrypt |
| Relational database | MySQL |
| Document database | MongoDB |
| User identity | MySQL |
| Application data | MongoDB |
| Document metadata | MongoDB |
| Physical documents | File/Object Storage |
| Audit logs | MongoDB |
| Course master data | MySQL |
| Authorization | Role-based |
| Business logic | Service layer |
| API validation | Validation middleware |
| Database relationship | `userId` reference |
| Frontend security | Route protection |
| Actual security | Backend authorization |

---

# 31. Final Mental Model

When implementing any new feature, ask these five questions:

### 1. Who is performing the operation?

```text
Student / Admin
```

### 2. What resource is being changed?

```text
User / Application / Document / Course
```

### 3. Which database owns that resource?

```text
MySQL / MongoDB
```

### 4. What business rules apply?

```text
Authentication
Authorization
Validation
Status transition
```

### 5. Does the operation need an audit record?

For important administrative operations, the answer should generally be **yes**.

---

## Recommended implementation starting point

The architecture should now be implemented in this order:

```text
backend/
   ↓
Express server
   ↓
MySQL connection
   ↓
MongoDB connection
   ↓
GET /api/health
   ↓
User model
   ↓
Registration
   ↓
Login
   ↓
JWT
   ↓
Role middleware
   ↓
Application model
   ↓
Student APIs
   ↓
Admin APIs
```

This gives us a clean progression from **infrastructure → authentication → business domain → administration**, rather than building disconnected APIs.