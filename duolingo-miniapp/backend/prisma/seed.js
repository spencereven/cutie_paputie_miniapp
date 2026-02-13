/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSections() {
  const sectionCount = await prisma.section.count();
  if (sectionCount > 0) {
    console.log('Seed skipped: sections already exist');
    return;
  }

  await prisma.section.createMany({
    data: [
      { title: 'Section 1', subtitle: 'Basics', sortOrder: 1, isLocked: false },
      { title: 'Section 2', subtitle: 'Greetings', sortOrder: 2, isLocked: false },
      { title: 'Section 3', subtitle: 'Food & Drink', sortOrder: 3, isLocked: false },
      { title: 'Section 4', subtitle: 'Numbers', sortOrder: 4, isLocked: true },
      { title: 'Section 5', subtitle: 'Colors', sortOrder: 5, isLocked: true },
      { title: 'Section 6', subtitle: 'Animals', sortOrder: 6, isLocked: true }
    ]
  });
}

async function seedOrgRelations() {
  const teacherPasswordHash = await bcrypt.hash('Teacher123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const campus = await prisma.campus.upsert({
    where: {
      name: 'Main Campus'
    },
    update: {
      city: 'Shenzhen'
    },
    create: {
      name: 'Main Campus',
      city: 'Shenzhen'
    }
  });

  const teacher = await prisma.user.upsert({
    where: {
      email: 'teacher.demo@miniapp.local'
    },
    update: {
      role: 'TEACHER',
      name: 'Teacher Demo',
      passwordHash: teacherPasswordHash
    },
    create: {
      email: 'teacher.demo@miniapp.local',
      name: 'Teacher Demo',
      role: 'TEACHER',
      passwordHash: teacherPasswordHash
    }
  });

  await prisma.user.upsert({
    where: {
      email: 'admin.demo@miniapp.local'
    },
    update: {
      role: 'ADMIN',
      name: 'Admin Demo',
      passwordHash: adminPasswordHash
    },
    create: {
      email: 'admin.demo@miniapp.local',
      name: 'Admin Demo',
      role: 'ADMIN',
      passwordHash: adminPasswordHash
    }
  });

  const classA = await prisma.classroom.upsert({
    where: {
      campusId_name: {
        campusId: campus.id,
        name: 'Class A1'
      }
    },
    update: {
      code: 'A1',
      managerTeacherId: teacher.id
    },
    create: {
      name: 'Class A1',
      code: 'A1',
      campusId: campus.id,
      managerTeacherId: teacher.id
    }
  });

  await prisma.classroom.upsert({
    where: {
      campusId_name: {
        campusId: campus.id,
        name: 'Class A2'
      }
    },
    update: {
      code: 'A2',
      managerTeacherId: teacher.id
    },
    create: {
      name: 'Class A2',
      code: 'A2',
      campusId: campus.id,
      managerTeacherId: teacher.id
    }
  });

  const firstStudent = await prisma.user.findFirst({
    where: {
      role: 'STUDENT',
      classroomId: null
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (firstStudent) {
    await prisma.user.update({
      where: {
        id: firstStudent.id
      },
      data: {
        classroomId: classA.id
      }
    });
  }

  return {
    classA,
    teacher
  };
}

async function ensureLessonWithAssets({
  classroomId,
  createdById,
  title,
  description,
  coverImageUrl,
  orderIndex,
  status,
  assets
}) {
  const existing = await prisma.lesson.findFirst({
    where: {
      classroomId,
      title
    }
  });

  let lesson;
  if (existing) {
    lesson = await prisma.lesson.update({
      where: {
        id: existing.id
      },
      data: {
        description,
        coverImageUrl: coverImageUrl || null,
        orderIndex,
        status,
        createdById,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });
  } else {
    lesson = await prisma.lesson.create({
      data: {
        classroomId,
        title,
        description,
        coverImageUrl: coverImageUrl || null,
        orderIndex,
        status,
        createdById,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });
  }

  await prisma.lessonAsset.deleteMany({
    where: {
      lessonId: lesson.id
    }
  });
  await prisma.lessonAsset.createMany({
    data: assets.map((item, idx) => ({
      lessonId: lesson.id,
      type: item.type,
      title: item.title,
      url: item.url,
      durationSec: item.durationSec || null,
      fileSizeBytes: item.fileSizeBytes || null,
      mimeType: item.mimeType || null,
      sortOrder: idx + 1,
      uploadedById: createdById
    }))
  });
}

async function main() {
  await seedSections();
  const { classA, teacher } = await seedOrgRelations();

  await ensureLessonWithAssets({
    classroomId: classA.id,
    createdById: teacher.id,
    title: 'Lesson 1 - Greetings',
    description: 'Classroom starter lesson with worksheet, audio and video.',
    coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80',
    orderIndex: 1,
    status: 'PUBLISHED',
    assets: [
      {
        type: 'FILE',
        title: 'Lesson 1 Worksheet.pdf',
        url: 'https://cdn.example.com/lessons/a1/lesson-1/worksheet.pdf',
        fileSizeBytes: 524288,
        mimeType: 'application/pdf'
      },
      {
        type: 'AUDIO',
        title: 'Lesson 1 Dialogue.mp3',
        url: 'https://cdn.example.com/lessons/a1/lesson-1/dialogue.mp3',
        durationSec: 185,
        fileSizeBytes: 3014656,
        mimeType: 'audio/mpeg'
      },
      {
        type: 'VIDEO',
        title: 'Lesson 1 Intro.mp4',
        url: 'https://cdn.example.com/lessons/a1/lesson-1/intro.mp4',
        durationSec: 420,
        fileSizeBytes: 15874355,
        mimeType: 'video/mp4'
      }
    ]
  });

  console.log('Seed completed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
