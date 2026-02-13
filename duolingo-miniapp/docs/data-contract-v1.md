# Data Contract V1

## 1. Roles and Organization
- `User.role`: `STUDENT | TEACHER | ADMIN`
- A student belongs to one class: `users.classroom_id -> classes.id`
- A class belongs to one campus: `classes.campus_id -> campuses.id`
- A teacher manages multiple classes: `classes.manager_teacher_id -> users.id`

## 2. Lesson Structure
- A class has multiple lessons: `lessons.classroom_id -> classes.id`
- A lesson has multiple assets: `lesson_assets.lesson_id -> lessons.id`
- A lesson can have a cover image URL: `lessons.cover_image_url`
- Asset type is fixed: `FILE | AUDIO | VIDEO`
- Teacher/Admin creates lessons and uploads assets:
  - `lessons.created_by_id -> users.id`
  - `lesson_assets.uploaded_by_id -> users.id`

## 3. Leaderboard Structure
- Scope enum: `CLASS | CAMPUS | NATIONAL`
- Snapshot table: `leaderboard_snapshots`
  - `scope_type`
  - `user_id`
  - `classroom_id` (optional, class scope)
  - `campus_id` (optional, campus scope)
  - `study_hours`
  - `rank`
  - `snapshot_date`

## 4. Core API Contract
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/leaderboard?scope=class|campus|national&limit=20&classroomId=1`
- `GET /api/v1/campuses`
- `GET /api/v1/classrooms/managed`
- `GET /api/v1/students/unassigned?keyword=&limit=100`
- `POST /api/v1/campuses/:campusId/classrooms`
- `GET /api/v1/classrooms/:classroomId/students`
- `POST /api/v1/classrooms/:classroomId/students/:studentId`
- `POST /api/v1/classrooms/:classroomId/students` (batch)
- `GET /api/v1/classrooms/:classroomId/lessons`
- `POST /api/v1/classrooms/:classroomId/lessons`
- `PATCH /api/v1/lessons/:lessonId`
- `POST /api/v1/lessons/:lessonId/assets`
- `DELETE /api/v1/lessons/:lessonId/assets/:assetId`
- `GET /api/v1/uploads/limits`
- `POST /api/v1/uploads/base64`
- `GET /api/v1/uploads/:filename`

## 5. Permission Rules
- Student:
  - Can read only lessons in own class
  - Can read only `PUBLISHED` lessons
- Teacher:
  - Can create classroom under campus
  - Can assign students into managed classroom
  - Can read/manage lessons in classes managed by this teacher
  - Can choose class leaderboard by `classroomId`
- Admin:
  - Full access

## 6. File Upload Note (V1)
- DB stores metadata and URL.
- Current dev mode supports local file upload by base64 API:
  1. `POST /api/v1/uploads/base64` to get hosted URL
  2. `POST /api/v1/lessons/:lessonId/assets` to attach resource
- Future production mode can switch to COS/S3/OSS signed upload.
