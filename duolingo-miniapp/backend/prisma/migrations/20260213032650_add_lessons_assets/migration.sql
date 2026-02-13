/*
  Warnings:

  - You are about to drop the column `scope` on the `leaderboard_snapshots` table. All the data in the column will be lost.
  - Added the required column `scope_type` to the `leaderboard_snapshots` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LeaderboardScopeType" AS ENUM ('CLASS', 'CAMPUS', 'NATIONAL');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LessonAssetType" AS ENUM ('FILE', 'AUDIO', 'VIDEO');

-- DropIndex
DROP INDEX "leaderboard_snapshots_scope_snapshot_date_rank_idx";

-- AlterTable
ALTER TABLE "leaderboard_snapshots" DROP COLUMN "scope",
ADD COLUMN     "campus_id" INTEGER,
ADD COLUMN     "classroom_id" INTEGER,
ADD COLUMN     "scope_type" "LeaderboardScopeType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "classroom_id" INTEGER,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "campuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "campus_id" INTEGER NOT NULL,
    "manager_teacher_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_assets" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "type" "LessonAssetType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration_sec" INTEGER,
    "file_size_bytes" INTEGER,
    "mime_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campuses_name_key" ON "campuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_code_key" ON "classes"("code");

-- CreateIndex
CREATE INDEX "classes_manager_teacher_id_idx" ON "classes"("manager_teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_campus_id_name_key" ON "classes"("campus_id", "name");

-- CreateIndex
CREATE INDEX "lessons_classroom_id_status_order_index_idx" ON "lessons"("classroom_id", "status", "order_index");

-- CreateIndex
CREATE INDEX "lessons_created_by_id_created_at_idx" ON "lessons"("created_by_id", "created_at");

-- CreateIndex
CREATE INDEX "lesson_assets_lesson_id_type_sort_order_idx" ON "lesson_assets"("lesson_id", "type", "sort_order");

-- CreateIndex
CREATE INDEX "lesson_assets_uploaded_by_id_idx" ON "lesson_assets"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_scope_type_snapshot_date_rank_idx" ON "leaderboard_snapshots"("scope_type", "snapshot_date", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_scope_type_classroom_id_snapshot_date_idx" ON "leaderboard_snapshots"("scope_type", "classroom_id", "snapshot_date", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_scope_type_campus_id_snapshot_date_ra_idx" ON "leaderboard_snapshots"("scope_type", "campus_id", "snapshot_date", "rank");

-- CreateIndex
CREATE INDEX "users_classroom_id_idx" ON "users"("classroom_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_manager_teacher_id_fkey" FOREIGN KEY ("manager_teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assets" ADD CONSTRAINT "lesson_assets_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assets" ADD CONSTRAINT "lesson_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
