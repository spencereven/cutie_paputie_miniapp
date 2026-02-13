const bcrypt = require('bcryptjs');
const { getSessionByCode } = require('../services/wechat.service');

function issueAccessToken(fastify, userId) {
  return fastify.jwt.sign(
    { uid: userId, type: 'access' },
    { expiresIn: fastify.env.ACCESS_TOKEN_EXPIRES_IN }
  );
}

function issueRefreshToken(fastify, userId) {
  return fastify.jwt.sign(
    { uid: userId, type: 'refresh' },
    { expiresIn: fastify.env.REFRESH_TOKEN_EXPIRES_IN }
  );
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
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

function buildWechatName(profile, fallback) {
  if (profile && profile.nickName && profile.nickName !== '微信用户') return profile.nickName;
  return fallback;
}

async function saveRefreshSession(fastify, userId, refreshToken) {
  const payload = fastify.jwt.verify(refreshToken);
  const expiresAt = payload && payload.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + 30 * 24 * 3600 * 1000);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await fastify.prisma.userSession.deleteMany({
    where: {
      userId
    }
  });
  await fastify.prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash,
      expiresAt,
      deviceInfo: 'miniapp'
    }
  });
}

async function buildAuthPayload(fastify, user) {
  const accessToken = issueAccessToken(fastify, user.id);
  const refreshToken = issueRefreshToken(fastify, user.id);
  await saveRefreshSession(fastify, user.id, refreshToken);
  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user)
  };
}

async function authRoutes(fastify) {
  fastify.post('/auth/register', async (request, reply) => {
    const { name, email, password, birthday } = request.body || {};

    if (!name || !String(name).trim()) {
      return reply.code(400).send({
        code: 40100,
        message: 'name_required',
        data: null
      });
    }
    if (!email || !isValidEmail(email)) {
      return reply.code(400).send({
        code: 40101,
        message: 'invalid_email',
        data: null
      });
    }
    if (!password || String(password).length < 6) {
      return reply.code(400).send({
        code: 40102,
        message: 'invalid_password',
        data: null
      });
    }
    if (!birthday || !isValidDate(birthday)) {
      return reply.code(400).send({
        code: 40103,
        message: 'invalid_birthday',
        data: null
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await fastify.prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });
    if (exists) {
      return reply.code(409).send({
        code: 40104,
        message: 'email_already_exists',
        data: null
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await fastify.prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        birthday: new Date(`${birthday}T00:00:00.000Z`)
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

    return {
      code: 0,
      message: 'ok',
      data: await buildAuthPayload(fastify, user)
    };
  });

  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body || {};
    const normalizedEmail = normalizeEmail(email);
    const user = await fastify.prisma.user.findUnique({
      where: {
        email: normalizedEmail
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

    if (!user || !user.passwordHash) {
      return reply.code(401).send({
        code: 40110,
        message: 'invalid_email_or_password',
        data: null
      });
    }

    const valid = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!valid) {
      return reply.code(401).send({
        code: 40110,
        message: 'invalid_email_or_password',
        data: null
      });
    }

    return {
      code: 0,
      message: 'ok',
      data: await buildAuthPayload(fastify, user)
    };
  });

  fastify.post('/auth/wechat-login', async (request, reply) => {
    const { code, profile } = request.body || {};
    if (!code) {
      return reply.code(400).send({
        code: 40010,
        message: 'code_required',
        data: null
      });
    }

    try {
      const session = await getSessionByCode({
        code,
        appId: fastify.env.WECHAT_APP_ID,
        appSecret: fastify.env.WECHAT_APP_SECRET,
        mockMode: fastify.env.WECHAT_MOCK_MODE
      });

      const openid = String(session.openid || '');
      if (!openid) {
        throw new Error('wechat_openid_missing');
      }

      const existing = await fastify.prisma.user.findUnique({
        where: {
          wechatOpenid: openid
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

      let user;
      if (existing) {
        user = await fastify.prisma.user.update({
          where: {
            id: existing.id
          },
          data: {
            name: buildWechatName(profile, existing.name),
            avatarUrl: (profile && profile.avatarUrl) ? profile.avatarUrl : existing.avatarUrl,
            wechatUnionid: session.unionid || existing.wechatUnionid
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
      } else {
        user = await fastify.prisma.user.create({
          data: {
            name: buildWechatName(profile, `User${Date.now().toString().slice(-6)}`),
            avatarUrl: (profile && profile.avatarUrl) ? profile.avatarUrl : '',
            wechatOpenid: openid,
            wechatUnionid: session.unionid || ''
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
      }

      return {
        code: 0,
        message: 'ok',
        data: await buildAuthPayload(fastify, user)
      };
    } catch (err) {
      request.log.error(err);
      return reply.code(401).send({
        code: 40011,
        message: 'wechat_login_failed',
        data: null
      });
    }
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body || {};
    if (!refreshToken) {
      return reply.code(400).send({
        code: 40012,
        message: 'refresh_token_required',
        data: null
      });
    }

    try {
      const payload = fastify.jwt.verify(refreshToken);
      if (!payload || payload.type !== 'refresh' || !payload.uid) {
        throw new Error('invalid_refresh_token');
      }

      const session = await fastify.prisma.userSession.findFirst({
        where: {
          userId: String(payload.uid)
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!session || session.expiresAt.getTime() < Date.now()) {
        throw new Error('refresh_session_missing_or_expired');
      }

      const valid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!valid) {
        throw new Error('refresh_token_mismatch');
      }

      return {
        code: 0,
        message: 'ok',
        data: {
          accessToken: issueAccessToken(fastify, String(payload.uid))
        }
      };
    } catch (err) {
      return reply.code(401).send({
        code: 40013,
        message: 'refresh_token_invalid',
        data: null
      });
    }
  });

  fastify.post('/auth/logout', async (request) => {
    const { refreshToken } = request.body || {};
    if (!refreshToken) {
      return {
        code: 0,
        message: 'ok',
        data: true
      };
    }

    try {
      const payload = fastify.jwt.verify(refreshToken);
      if (payload && payload.uid) {
        await fastify.prisma.userSession.deleteMany({
          where: {
            userId: String(payload.uid)
          }
        });
      }
    } catch (err) {
      request.log.warn('logout_with_invalid_refresh_token');
    }

    return {
      code: 0,
      message: 'ok',
      data: true
    };
  });
}

module.exports = authRoutes;
