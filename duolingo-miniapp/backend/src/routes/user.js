function isValidDate(value) {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value;
}

function toPublicUser(user) {
  const managedClasses = Array.isArray(user.managedClasses)
    ? user.managedClasses.map((item) => ({
      id: item.id,
      name: item.name,
      campusId: item.campusId
    }))
    : [];

  return {
    id: user.id,
    email: user.email || null,
    name: user.name,
    role: user.role,
    birthday: user.birthday ? user.birthday.toISOString().slice(0, 10) : '',
    avatarUrl: user.avatarUrl || '',
    wechatOpenid: user.wechatOpenid || '',
    wechatUnionid: user.wechatUnionid || '',
    classroomId: user.classroomId || null,
    classroomName: user.classroom ? user.classroom.name : '',
    campusId: (user.classroom && user.classroom.campus) ? user.classroom.campus.id : null,
    campusName: (user.classroom && user.classroom.campus) ? user.classroom.campus.name : '',
    managedClasses,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

async function userRoutes(fastify) {
  fastify.get('/users/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: String(request.user.uid)
      },
      include: {
        classroom: {
          include: {
            campus: true
          }
        },
        managedClasses: true
      }
    });

    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }

    return {
      code: 0,
      message: 'ok',
      data: toPublicUser(user)
    };
  });

  fastify.patch('/users/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { name, birthday } = request.body || {};
    if (birthday && !isValidDate(birthday)) {
      return reply.code(400).send({
        code: 40021,
        message: 'invalid_birthday',
        data: null
      });
    }

    const patch = {};
    if (typeof name === 'string' && name.trim()) patch.name = name.trim();
    if (typeof birthday === 'string') patch.birthday = new Date(`${birthday}T00:00:00.000Z`);

    const userId = String(request.user.uid);
    const exists = await fastify.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!exists) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }

    const nextUser = await fastify.prisma.user.update({
      where: {
        id: userId
      },
      data: patch,
      include: {
        classroom: {
          include: {
            campus: true
          }
        },
        managedClasses: true
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: toPublicUser(nextUser)
    };
  });
}

module.exports = userRoutes;
