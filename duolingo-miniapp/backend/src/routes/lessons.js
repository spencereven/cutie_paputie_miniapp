const fs = require('node:fs/promises');
const path = require('node:path');
const { recordAdminAction } = require('../services/admin-action-log.service');

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

function parseId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') return null;
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

function normalizeLessonStatus(value) {
  const status = String(value || '').trim().toUpperCase();
  if (status === 'DRAFT' || status === 'PUBLISHED' || status === 'ARCHIVED') return status;
  return null;
}

function normalizeAssetType(value) {
  const type = String(value || '').trim().toUpperCase();
  if (type === 'FILE' || type === 'AUDIO' || type === 'VIDEO') return type;
  return null;
}

function normalizeOptionalUrl(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function isTeacherOrAdmin(role) {
  return role === 'TEACHER' || role === 'ADMIN';
}

function canViewClassroom(user, classroomId) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'TEACHER') {
    return Array.isArray(user.managedClasses) && user.managedClasses.some((item) => item.id === classroomId);
  }
  return user.classroomId === classroomId;
}

function canManageClassroom(user, classroomId) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role !== 'TEACHER') return false;
  return Array.isArray(user.managedClasses) && user.managedClasses.some((item) => item.id === classroomId);
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

function toAssetPayload(item) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    url: item.url,
    durationSec: item.durationSec || null,
    fileSizeBytes: item.fileSizeBytes || null,
    mimeType: item.mimeType || '',
    sortOrder: item.sortOrder,
    uploadedById: item.uploadedById || null,
    createdAt: item.createdAt.toISOString()
  };
}

function toLessonPayload(item) {
  return {
    id: item.id,
    classroomId: item.classroomId,
    title: item.title,
    description: item.description || '',
    coverImageUrl: item.coverImageUrl || '',
    orderIndex: item.orderIndex,
    status: item.status,
    createdById: item.createdById,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    assets: Array.isArray(item.assets) ? item.assets.map(toAssetPayload) : []
  };
}

function buildAssetCreateData(asset, index, uploaderId) {
  return {
    type: normalizeAssetType(asset.type),
    title: String(asset.title || '').trim(),
    url: String(asset.url || '').trim(),
    durationSec: parseOptionalInt(asset.durationSec),
    fileSizeBytes: parseOptionalInt(asset.fileSizeBytes),
    mimeType: asset.mimeType ? String(asset.mimeType).trim() : null,
    sortOrder: parseOptionalInt(asset.sortOrder) || (index + 1),
    uploadedById: uploaderId
  };
}

function validateAssetsInput(assets) {
  if (!Array.isArray(assets)) return { ok: true, data: [] };
  const normalized = assets.map((item, index) => buildAssetCreateData(item || {}, index, null));
  const invalid = normalized.some((item) => !item.type || !item.title || !item.url);
  if (invalid) {
    return { ok: false, message: 'invalid_assets' };
  }
  return { ok: true, data: normalized };
}

function extractLocalUploadFilename(rawUrl) {
  const input = String(rawUrl || '').trim();
  if (!input) return '';

  let pathname = input;
  try {
    if (/^https?:\/\//i.test(input)) {
      pathname = new URL(input).pathname || '';
    }
  } catch (err) {
    pathname = input;
  }

  const match = pathname.match(/\/api\/v1\/uploads\/([^/?#]+)/i);
  if (!match || !match[1]) return '';

  const fileName = decodeURIComponent(match[1]);
  const safe = path.basename(fileName);
  return safe === fileName ? safe : '';
}

async function lessonsRoutes(fastify) {
  fastify.get('/classrooms/:classroomId/lessons', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const classroomId = parseId(request.params.classroomId);
    if (!classroomId) {
      return reply.code(400).send({
        code: 40140,
        message: 'invalid_classroom_id',
        data: null
      });
    }

    const user = await getActor(fastify, request.user.uid);
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }

    if (!canViewClassroom(user, classroomId)) {
      return reply.code(403).send({
        code: 40141,
        message: 'forbidden_classroom_access',
        data: null
      });
    }

    const where = {
      classroomId
    };
    const keyword = String(request.query && request.query.keyword || '').trim();
    if (keyword) {
      where.title = {
        contains: keyword,
        mode: 'insensitive'
      };
    }
    if (user.role === 'STUDENT') {
      where.status = 'PUBLISHED';
    } else {
      const status = normalizeLessonStatus(request.query && request.query.status);
      if (status) where.status = status;
    }

    const paginate = shouldPaginate(request.query);
    const page = parsePositiveInt(request.query && request.query.page, 1, 1, 100000);
    const pageSize = parsePositiveInt(request.query && request.query.pageSize, 20, 1, 100);
    const orderBy = [
      {
        orderIndex: 'asc'
      },
      {
        id: 'asc'
      }
    ];
    const include = {
      assets: {
        orderBy: [
          {
            sortOrder: 'asc'
          },
          {
            id: 'asc'
          }
        ]
      }
    };

    if (paginate) {
      const skip = (page - 1) * pageSize;
      const [total, lessons] = await fastify.prisma.$transaction([
        fastify.prisma.lesson.count({ where }),
        fastify.prisma.lesson.findMany({
          where,
          orderBy,
          include,
          skip,
          take: pageSize
        })
      ]);

      return {
        code: 0,
        message: 'ok',
        data: {
          items: lessons.map(toLessonPayload),
          pagination: toPagination(page, pageSize, total)
        }
      };
    }

    const lessons = await fastify.prisma.lesson.findMany({
      where,
      orderBy,
      include
    });

    return {
      code: 0,
      message: 'ok',
      data: lessons.map(toLessonPayload)
    };
  });

  fastify.post('/classrooms/:classroomId/lessons', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const classroomId = parseId(request.params.classroomId);
    if (!classroomId) {
      return reply.code(400).send({
        code: 40140,
        message: 'invalid_classroom_id',
        data: null
      });
    }

    const user = await getActor(fastify, request.user.uid);
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(user.role) || !canManageClassroom(user, classroomId)) {
      return reply.code(403).send({
        code: 40142,
        message: 'forbidden_lesson_manage',
        data: null
      });
    }

    const { title, description, coverImageUrl, orderIndex, status, assets } = request.body || {};
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) {
      return reply.code(400).send({
        code: 40143,
        message: 'title_required',
        data: null
      });
    }

    const normalizedStatus = normalizeLessonStatus(status || 'DRAFT');
    if (!normalizedStatus) {
      return reply.code(400).send({
        code: 40144,
        message: 'invalid_lesson_status',
        data: null
      });
    }

    const parsedOrder = Number.parseInt(orderIndex, 10);
    const safeOrder = Number.isNaN(parsedOrder) ? 0 : parsedOrder;
    const assetValidation = validateAssetsInput(assets);
    if (!assetValidation.ok) {
      return reply.code(400).send({
        code: 40145,
        message: assetValidation.message,
        data: null
      });
    }

    const classroomExists = await fastify.prisma.classroom.findUnique({
      where: {
        id: classroomId
      }
    });
    if (!classroomExists) {
      return reply.code(404).send({
        code: 40146,
        message: 'classroom_not_found',
        data: null
      });
    }

    const lesson = await fastify.prisma.lesson.create({
      data: {
        classroomId,
        title: normalizedTitle,
        description: description ? String(description).trim() : null,
        coverImageUrl: normalizeOptionalUrl(coverImageUrl),
        orderIndex: safeOrder,
        status: normalizedStatus,
        createdById: user.id,
        publishedAt: normalizedStatus === 'PUBLISHED' ? new Date() : null,
        assets: {
          create: assetValidation.data.map((item) => ({
            ...item,
            uploadedById: user.id
          }))
        }
      },
      include: {
        assets: {
          orderBy: [
            {
              sortOrder: 'asc'
            },
            {
              id: 'asc'
            }
          ]
        }
      }
    });

    await recordAdminAction(fastify, {
      actorUserId: user.id,
      actorRole: user.role,
      action: 'create_lesson',
      targetType: 'lesson',
      targetId: lesson.id,
      detail: {
        classroomId: lesson.classroomId,
        status: lesson.status
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: toLessonPayload(lesson)
    };
  });

  fastify.patch('/lessons/:lessonId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const lessonId = parseId(request.params.lessonId);
    if (!lessonId) {
      return reply.code(400).send({
        code: 40147,
        message: 'invalid_lesson_id',
        data: null
      });
    }

    const lesson = await fastify.prisma.lesson.findUnique({
      where: {
        id: lessonId
      },
      include: {
        assets: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
        }
      }
    });
    if (!lesson) {
      return reply.code(404).send({
        code: 40148,
        message: 'lesson_not_found',
        data: null
      });
    }

    const user = await getActor(fastify, request.user.uid);
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(user.role) || !canManageClassroom(user, lesson.classroomId)) {
      return reply.code(403).send({
        code: 40142,
        message: 'forbidden_lesson_manage',
        data: null
      });
    }

    const { title, description, coverImageUrl, orderIndex, status } = request.body || {};
    const patch = {};
    if (typeof title === 'string' && title.trim()) patch.title = title.trim();
    if (typeof description === 'string') patch.description = description.trim() || null;
    if (coverImageUrl !== undefined) patch.coverImageUrl = normalizeOptionalUrl(coverImageUrl);
    if (orderIndex !== undefined) {
      const parsedOrder = Number.parseInt(orderIndex, 10);
      if (!Number.isNaN(parsedOrder)) patch.orderIndex = parsedOrder;
    }
    if (status !== undefined) {
      const normalizedStatus = normalizeLessonStatus(status);
      if (!normalizedStatus) {
        return reply.code(400).send({
          code: 40144,
          message: 'invalid_lesson_status',
          data: null
        });
      }
      patch.status = normalizedStatus;
      patch.publishedAt = normalizedStatus === 'PUBLISHED' ? (lesson.publishedAt || new Date()) : null;
    }

    const updated = await fastify.prisma.lesson.update({
      where: {
        id: lessonId
      },
      data: patch,
      include: {
        assets: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
        }
      }
    });

    await recordAdminAction(fastify, {
      actorUserId: user.id,
      actorRole: user.role,
      action: 'update_lesson',
      targetType: 'lesson',
      targetId: updated.id,
      detail: {
        changedFields: Object.keys(patch),
        classroomId: updated.classroomId
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: toLessonPayload(updated)
    };
  });

  fastify.post('/lessons/:lessonId/assets', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const lessonId = parseId(request.params.lessonId);
    if (!lessonId) {
      return reply.code(400).send({
        code: 40147,
        message: 'invalid_lesson_id',
        data: null
      });
    }

    const lesson = await fastify.prisma.lesson.findUnique({
      where: {
        id: lessonId
      }
    });
    if (!lesson) {
      return reply.code(404).send({
        code: 40148,
        message: 'lesson_not_found',
        data: null
      });
    }

    const user = await getActor(fastify, request.user.uid);
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(user.role) || !canManageClassroom(user, lesson.classroomId)) {
      return reply.code(403).send({
        code: 40142,
        message: 'forbidden_lesson_manage',
        data: null
      });
    }

    const { type, title, url, durationSec, fileSizeBytes, mimeType, sortOrder } = request.body || {};
    const normalizedType = normalizeAssetType(type);
    const normalizedTitle = String(title || '').trim();
    const normalizedUrl = String(url || '').trim();
    if (!normalizedType || !normalizedTitle || !normalizedUrl) {
      return reply.code(400).send({
        code: 40145,
        message: 'invalid_assets',
        data: null
      });
    }

    const asset = await fastify.prisma.lessonAsset.create({
      data: {
        lessonId,
        type: normalizedType,
        title: normalizedTitle,
        url: normalizedUrl,
        durationSec: parseOptionalInt(durationSec),
        fileSizeBytes: parseOptionalInt(fileSizeBytes),
        mimeType: mimeType ? String(mimeType).trim() : null,
        sortOrder: parseOptionalInt(sortOrder) || 999,
        uploadedById: user.id
      }
    });

    await recordAdminAction(fastify, {
      actorUserId: user.id,
      actorRole: user.role,
      action: 'add_lesson_asset',
      targetType: 'lesson_asset',
      targetId: asset.id,
      detail: {
        lessonId,
        type: asset.type
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: toAssetPayload(asset)
    };
  });

  fastify.delete('/lessons/:lessonId/assets/:assetId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const lessonId = parseId(request.params.lessonId);
    const assetId = parseId(request.params.assetId);
    if (!lessonId || !assetId) {
      return reply.code(400).send({
        code: 40149,
        message: 'invalid_asset_or_lesson_id',
        data: null
      });
    }

    const lesson = await fastify.prisma.lesson.findUnique({
      where: { id: lessonId }
    });
    if (!lesson) {
      return reply.code(404).send({
        code: 40148,
        message: 'lesson_not_found',
        data: null
      });
    }

    const user = await getActor(fastify, request.user.uid);
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(user.role) || !canManageClassroom(user, lesson.classroomId)) {
      return reply.code(403).send({
        code: 40142,
        message: 'forbidden_lesson_manage',
        data: null
      });
    }

    const asset = await fastify.prisma.lessonAsset.findFirst({
      where: {
        id: assetId,
        lessonId
      }
    });
    if (!asset) {
      return reply.code(404).send({
        code: 40150,
        message: 'asset_not_found',
        data: null
      });
    }

    const assetUrl = asset.url || '';
    const maybeLocalFile = extractLocalUploadFilename(assetUrl);

    await fastify.prisma.lessonAsset.delete({
      where: {
        id: asset.id
      }
    });

    if (maybeLocalFile) {
      const stillReferenced = await fastify.prisma.lessonAsset.count({
        where: {
          url: assetUrl
        }
      });
      if (stillReferenced === 0) {
        const localPath = path.join(LOCAL_UPLOAD_DIR, maybeLocalFile);
        await fs.unlink(localPath).catch(() => {});
      }
    }

    await recordAdminAction(fastify, {
      actorUserId: user.id,
      actorRole: user.role,
      action: 'delete_lesson_asset',
      targetType: 'lesson_asset',
      targetId: asset.id,
      detail: {
        lessonId,
        type: asset.type,
        title: asset.title
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: {
        id: asset.id
      }
    };
  });
}

module.exports = lessonsRoutes;
