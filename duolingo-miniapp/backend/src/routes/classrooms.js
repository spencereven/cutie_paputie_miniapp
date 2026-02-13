const { recordAdminAction } = require('../services/admin-action-log.service');

function parseId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parsePositiveInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function shouldPaginate(query) {
  return String(query && query.paginate || '').trim() === '1';
}

function toPagination(page, pageSize, total) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

function isTeacherOrAdmin(role) {
  return role === 'TEACHER' || role === 'ADMIN';
}

async function getActor(fastify, userId) {
  return fastify.prisma.user.findUnique({
    where: {
      id: String(userId)
    },
    include: {
      managedClasses: true
    }
  });
}

function canManageClassroom(actor, classroomId) {
  if (!actor) return false;
  if (actor.role === 'ADMIN') return true;
  if (actor.role !== 'TEACHER') return false;
  return Array.isArray(actor.managedClasses) && actor.managedClasses.some((item) => item.id === classroomId);
}

function toClassroomPayload(classroom) {
  return {
    id: classroom.id,
    name: classroom.name,
    code: classroom.code || '',
    campusId: classroom.campusId,
    campus: classroom.campus ? {
      id: classroom.campus.id,
      name: classroom.campus.name,
      city: classroom.campus.city || ''
    } : null,
    managerTeacherId: classroom.managerTeacherId || null,
    managerTeacher: classroom.managerTeacher ? {
      id: classroom.managerTeacher.id,
      name: classroom.managerTeacher.name,
      email: classroom.managerTeacher.email || null
    } : null,
    studentCount: classroom._count ? classroom._count.students : undefined,
    createdAt: classroom.createdAt.toISOString()
  };
}

function toStudentPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email || null,
    role: user.role,
    classroomId: user.classroomId || null,
    createdAt: user.createdAt.toISOString()
  };
}

function parseStudentIds(value) {
  if (!Array.isArray(value)) return [];
  const unique = new Set(
    value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  );
  return Array.from(unique);
}

function buildStudentSearchWhere(keyword) {
  const normalized = String(keyword || '').trim();
  if (!normalized) return {};
  return {
    OR: [
      {
        name: {
          contains: normalized,
          mode: 'insensitive'
        }
      },
      {
        email: {
          contains: normalized,
          mode: 'insensitive'
        }
      }
    ]
  };
}

async function classroomsRoutes(fastify) {
  fastify.get('/campuses', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const campuses = await fastify.prisma.campus.findMany({
      orderBy: [{ name: 'asc' }]
    });

    return {
      code: 0,
      message: 'ok',
      data: campuses.map((item) => ({
        id: item.id,
        name: item.name,
        city: item.city || '',
        createdAt: item.createdAt.toISOString()
      }))
    };
  });

  fastify.get('/classrooms/managed', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const campusId = parseId(request.query && request.query.campusId);
    const where = {};
    if (actor.role === 'TEACHER') where.managerTeacherId = actor.id;
    if (campusId) where.campusId = campusId;

    const classrooms = await fastify.prisma.classroom.findMany({
      where,
      orderBy: [
        { campusId: 'asc' },
        { name: 'asc' }
      ],
      include: {
        campus: true,
        managerTeacher: true,
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: classrooms.map(toClassroomPayload)
    };
  });

  fastify.get('/students/unassigned', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const paginate = shouldPaginate(request.query);
    const page = parsePositiveInt(request.query && request.query.page, 1, 1, 100000);
    const pageSize = parsePositiveInt(request.query && request.query.pageSize, 20, 1, 100);
    const limit = Math.min(Math.max(parseId(request.query && request.query.limit) || 50, 1), 200);
    const where = {
      role: 'STUDENT',
      classroomId: null,
      ...buildStudentSearchWhere(request.query && request.query.keyword)
    };

    if (paginate) {
      const skip = (page - 1) * pageSize;
      const [total, students] = await fastify.prisma.$transaction([
        fastify.prisma.user.count({ where }),
        fastify.prisma.user.findMany({
          where,
          orderBy: [{ createdAt: 'asc' }],
          skip,
          take: pageSize
        })
      ]);
      return {
        code: 0,
        message: 'ok',
        data: {
          items: students.map(toStudentPayload),
          pagination: toPagination(page, pageSize, total)
        }
      };
    }

    const students = await fastify.prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }],
      take: limit
    });

    return {
      code: 0,
      message: 'ok',
      data: students.map(toStudentPayload)
    };
  });

  fastify.post('/campuses/:campusId/classrooms', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const campusId = parseId(request.params.campusId);
    if (!campusId) {
      return reply.code(400).send({
        code: 40161,
        message: 'invalid_campus_id',
        data: null
      });
    }

    const { name, code, managerTeacherId } = request.body || {};
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      return reply.code(400).send({
        code: 40162,
        message: 'classroom_name_required',
        data: null
      });
    }

    const campus = await fastify.prisma.campus.findUnique({
      where: {
        id: campusId
      }
    });
    if (!campus) {
      return reply.code(404).send({
        code: 40163,
        message: 'campus_not_found',
        data: null
      });
    }

    let managerId = actor.id;
    if (actor.role === 'ADMIN' && managerTeacherId) {
      managerId = String(managerTeacherId).trim();
    }
    if (actor.role === 'TEACHER' && managerTeacherId && String(managerTeacherId).trim() !== actor.id) {
      return reply.code(403).send({
        code: 40164,
        message: 'forbidden_manager_teacher_override',
        data: null
      });
    }

    const manager = await fastify.prisma.user.findUnique({
      where: {
        id: managerId
      }
    });
    if (!manager || !isTeacherOrAdmin(manager.role)) {
      return reply.code(400).send({
        code: 40165,
        message: 'invalid_manager_teacher',
        data: null
      });
    }

    try {
      const classroom = await fastify.prisma.classroom.create({
        data: {
          name: normalizedName,
          code: code ? String(code).trim() : null,
          campusId,
          managerTeacherId: manager.id
        },
        include: {
          campus: true,
          managerTeacher: true,
          _count: {
            select: {
              students: true
            }
          }
        }
      });

      await recordAdminAction(fastify, {
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'create_classroom',
        targetType: 'classroom',
        targetId: classroom.id,
        detail: {
          campusId: classroom.campusId,
          managerTeacherId: classroom.managerTeacherId
        }
      });

      return {
        code: 0,
        message: 'ok',
        data: toClassroomPayload(classroom)
      };
    } catch (err) {
      if (err && err.code === 'P2002') {
        return reply.code(409).send({
          code: 40166,
          message: 'classroom_already_exists',
          data: null
        });
      }
      throw err;
    }
  });

  fastify.get('/classrooms/:classroomId/students', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const classroomId = parseId(request.params.classroomId);
    if (!classroomId) {
      return reply.code(400).send({
        code: 40167,
        message: 'invalid_classroom_id',
        data: null
      });
    }
    if (!canManageClassroom(actor, classroomId)) {
      return reply.code(403).send({
        code: 40168,
        message: 'forbidden_classroom_access',
        data: null
      });
    }

    const where = {
      classroomId,
      role: 'STUDENT',
      ...buildStudentSearchWhere(request.query && request.query.keyword)
    };

    const paginate = shouldPaginate(request.query);
    const page = parsePositiveInt(request.query && request.query.page, 1, 1, 100000);
    const pageSize = parsePositiveInt(request.query && request.query.pageSize, 20, 1, 100);

    if (paginate) {
      const skip = (page - 1) * pageSize;
      const [total, students] = await fastify.prisma.$transaction([
        fastify.prisma.user.count({ where }),
        fastify.prisma.user.findMany({
          where,
          orderBy: [{ createdAt: 'asc' }],
          skip,
          take: pageSize
        })
      ]);

      return {
        code: 0,
        message: 'ok',
        data: {
          items: students.map(toStudentPayload),
          pagination: toPagination(page, pageSize, total)
        }
      };
    }

    const students = await fastify.prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }]
    });

    return {
      code: 0,
      message: 'ok',
      data: students.map(toStudentPayload)
    };
  });

  fastify.post('/classrooms/:classroomId/students/:studentId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const classroomId = parseId(request.params.classroomId);
    if (!classroomId) {
      return reply.code(400).send({
        code: 40167,
        message: 'invalid_classroom_id',
        data: null
      });
    }
    if (!canManageClassroom(actor, classroomId)) {
      return reply.code(403).send({
        code: 40168,
        message: 'forbidden_classroom_access',
        data: null
      });
    }

    const studentId = String(request.params.studentId || '').trim();
    if (!studentId) {
      return reply.code(400).send({
        code: 40169,
        message: 'invalid_student_id',
        data: null
      });
    }

    const student = await fastify.prisma.user.findUnique({
      where: {
        id: studentId
      }
    });
    if (!student) {
      return reply.code(404).send({
        code: 40170,
        message: 'student_not_found',
        data: null
      });
    }
    if (student.role !== 'STUDENT') {
      return reply.code(400).send({
        code: 40171,
        message: 'target_user_not_student',
        data: null
      });
    }

    const updated = await fastify.prisma.user.update({
      where: {
        id: student.id
      },
      data: {
        classroomId
      }
    });

    await recordAdminAction(fastify, {
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'assign_student_classroom',
      targetType: 'user',
      targetId: updated.id,
      detail: {
        classroomId,
        fromClassroomId: student.classroomId || null
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: toStudentPayload(updated)
    };
  });

  fastify.post('/classrooms/:classroomId/students', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const actor = await getActor(fastify, request.user.uid);
    if (!actor) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(actor.role)) {
      return reply.code(403).send({
        code: 40160,
        message: 'forbidden_teacher_required',
        data: null
      });
    }

    const classroomId = parseId(request.params.classroomId);
    if (!classroomId) {
      return reply.code(400).send({
        code: 40167,
        message: 'invalid_classroom_id',
        data: null
      });
    }
    if (!canManageClassroom(actor, classroomId)) {
      return reply.code(403).send({
        code: 40168,
        message: 'forbidden_classroom_access',
        data: null
      });
    }

    const studentIds = parseStudentIds(request.body && request.body.studentIds);
    if (studentIds.length === 0) {
      return reply.code(400).send({
        code: 40172,
        message: 'student_ids_required',
        data: null
      });
    }

    const students = await fastify.prisma.user.findMany({
      where: {
        id: {
          in: studentIds
        }
      }
    });
    const studentById = new Map(students.map((item) => [item.id, item]));
    const missingIds = studentIds.filter((id) => !studentById.has(id));
    if (missingIds.length > 0) {
      return reply.code(404).send({
        code: 40173,
        message: 'some_students_not_found',
        data: {
          missingIds
        }
      });
    }

    const nonStudentIds = studentIds.filter((id) => studentById.get(id).role !== 'STUDENT');
    if (nonStudentIds.length > 0) {
      return reply.code(400).send({
        code: 40174,
        message: 'contains_non_student_users',
        data: {
          nonStudentIds
        }
      });
    }

    const result = await fastify.prisma.user.updateMany({
      where: {
        id: {
          in: studentIds
        }
      },
      data: {
        classroomId
      }
    });

    await recordAdminAction(fastify, {
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'assign_students_classroom_batch',
      targetType: 'classroom',
      targetId: classroomId,
      detail: {
        updatedCount: result.count,
        studentIds: studentIds.slice(0, 100)
      }
    });

    const updated = await fastify.prisma.user.findMany({
      where: {
        id: {
          in: studentIds
        }
      },
      orderBy: [{ createdAt: 'asc' }]
    });

    return {
      code: 0,
      message: 'ok',
      data: {
        updatedCount: result.count,
        students: updated.map(toStudentPayload)
      }
    };
  });
}

module.exports = classroomsRoutes;
