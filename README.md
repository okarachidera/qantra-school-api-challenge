# School Management System API

Backend assessment project implementing a school management REST API using the provided template architecture.

## Stack
- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication

## Features
- JWT auth (`register`, `login`, `me`)
- RBAC (`superadmin`, `school_admin`)
- School management (superadmin only)
- School admin creation (superadmin only)
- Classroom management (school admin scoped to own school)
- Student management (school admin scoped to own school)
- Validation layer
- Global error handling
- Security headers
- Rate limiting
- OpenAPI docs at `/api/docs`

## Project Structure
- `index.js`: app bootstrap
- `config/`: env/config loading
- `loaders/`: manager/middleware/validator loaders
- `managers/entities/`: domain modules (`auth`, `school`, `user`, `classroom`, `student`)
- `mws/`: middleware modules (`__auth`, `__role`, etc.)
- `docs/openapi.js`: OpenAPI definition

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create env file:
```bash
cp .env.example .env
```

3. Ensure infrastructure is running:
- MongoDB
- Redis (optional, only if `REDIS_ENABLED=true`)

4. Start app:
```bash
npm run dev
```

## Environment Variables
See `.env.example`.

Minimum required:
- `LONG_TOKEN_SECRET`
- `SHORT_TOKEN_SECRET`
- `NACL_SECRET`
- `MONGO_URI`
- Optional Redis stack: `REDIS_ENABLED=true` plus Redis URLs

## API Docs
- Swagger UI: `http://localhost:5111/api/docs`
- OpenAPI JSON: `http://localhost:5111/api/docs/openapi.json`

## Auth
Use JWT as:
- `Authorization: Bearer <token>`
or
- `token: <token>`

## Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Schools (superadmin)
- `POST /api/school/createSchool`
- `GET /api/school/listSchools`
- `GET /api/school/getSchool?schoolId=<id>`
- `PUT /api/school/updateSchool?schoolId=<id>`
- `DELETE /api/school/deleteSchool?schoolId=<id>`

### School Admins (superadmin)
- `POST /api/user/createSchoolAdmin`

### Classrooms (school_admin, own school only)
- `POST /api/classroom/createClassroom`
- `GET /api/classroom/listClassrooms`
- `PUT /api/classroom/updateClassroom?classroomId=<id>`
- `DELETE /api/classroom/deleteClassroom?classroomId=<id>`

### Students (school_admin, own school only)
- `POST /api/student/createStudent`
- `GET /api/student/listStudents`
- `PUT /api/student/updateStudent?studentId=<id>`
- `DELETE /api/student/deleteStudent?studentId=<id>`

## Deployment Readiness Notes
- Configure secrets via environment variables
- Set production `MONGO_URI`
- Optional: set Redis URLs and `REDIS_ENABLED=true` if using Redis stack
- Tune:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX`
  - `REQUEST_BODY_LIMIT`
