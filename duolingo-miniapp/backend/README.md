# Backend Quick Start

## 1) Install
```bash
cd backend
npm install
```

## 2) Configure
```bash
cp .env.example .env
```

Set at least:
- `JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `UPLOAD_MAX_MB` (e.g. `100`)
- `BODY_LIMIT_MB` (e.g. `170`, should be greater than `UPLOAD_MAX_MB`)

For local no-secret mode, keep:
- `WECHAT_MOCK_MODE=true`

## 3) Database (required)
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If you pulled latest lesson-cover changes, run once to apply pending migration:
```bash
npm run prisma:migrate
```

## 4) Verify in DBeaver
- Host: `127.0.0.1`
- Port: `5432`
- Database: `duolingo_miniapp`
- Username: `postgres`
- Password: `postgres` (or your local password)

After connect, inspect tables:
- `users`
- `user_sessions`
- `campuses`
- `classes`
- `lessons`
- `lesson_assets`
- `sections`
- `levels`

## 5) Run
```bash
npm run dev
```

Server default:
- `http://127.0.0.1:3000/api/v1/health`
- `http://127.0.0.1:3000/admin` (Web admin dashboard)

Web admin pages:
- `http://127.0.0.1:3000/admin/login`
- `http://127.0.0.1:3000/admin/dashboard`
- `http://127.0.0.1:3000/admin/classrooms`
- `http://127.0.0.1:3000/admin/lessons`
- `http://127.0.0.1:3000/admin/uploads`

## 6) Demo Web Admin Accounts
- Teacher
  - Email: `teacher.demo@miniapp.local`
  - Password: `Teacher123!`
- Admin
  - Email: `admin.demo@miniapp.local`
  - Password: `Admin123!`

## Upload Limit
- Configurable by `.env`:
  - `UPLOAD_MAX_MB=100`
  - `BODY_LIMIT_MB=170`
- `POST /api/v1/uploads/base64` uses that limit per file.

## Current Stage B routes
- `POST /api/v1/auth/wechat-login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/sections`
- `GET /api/v1/sections/:id`
- `GET /api/v1/leaderboard?scope=class|campus|national&limit=20&classroomId=1`
- `GET /api/v1/campuses`
- `GET /api/v1/classrooms/managed`
- `GET /api/v1/students/unassigned?keyword=&limit=100`
- `POST /api/v1/campuses/:campusId/classrooms`
- `GET /api/v1/classrooms/:classroomId/students`
- `POST /api/v1/classrooms/:classroomId/students/:studentId`
- `POST /api/v1/classrooms/:classroomId/students`
- `GET /api/v1/classrooms/:classroomId/lessons`
- `POST /api/v1/classrooms/:classroomId/lessons`
- `PATCH /api/v1/lessons/:lessonId`
- `POST /api/v1/lessons/:lessonId/assets`
- `DELETE /api/v1/lessons/:lessonId/assets/:assetId`
- `GET /api/v1/uploads/limits`
- `POST /api/v1/uploads/base64`
- `GET /api/v1/uploads/:filename`
