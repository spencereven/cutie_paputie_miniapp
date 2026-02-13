const mockLeaderboard = require('../mocks/leaderboard');

function normalizeScope(value) {
  const normalized = String(value || 'class').trim().toLowerCase();
  if (normalized === 'campus' || normalized === 'national') return normalized;
  return 'class';
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 20;
  return Math.max(3, Math.min(parsed, 100));
}

function normalizeClassroomId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function ensureTopThree(rows) {
  const placeholders = [
    { id: 'placeholder-1', rank: 1, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' },
    { id: 'placeholder-2', rank: 2, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' },
    { id: 'placeholder-3', rank: 3, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' }
  ];
  return [0, 1, 2].map((idx) => rows[idx] || placeholders[idx]);
}

function buildCurrentUserRow(user, rows) {
  const found = rows.find((item) => item.userId && item.userId === user.id);
  if (found) {
    return {
      rank: found.rank,
      name: found.name,
      initial: found.initial,
      studyHours: found.studyHours
    };
  }

  const fallbackHours = rows.length > 0 ? Math.max(1, rows[rows.length - 1].studyHours - 2) : 1;
  const displayName = String(user.name || 'User').trim() || 'User';
  return {
    rank: rows.length + 1,
    name: displayName,
    initial: displayName.slice(0, 1).toUpperCase(),
    studyHours: fallbackHours
  };
}

async function leaderboardRoutes(fastify) {
  fastify.get('/leaderboard', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const scope = normalizeScope(request.query && request.query.scope);
    const limit = normalizeLimit(request.query && request.query.limit);
    const requestedClassroomId = normalizeClassroomId(request.query && request.query.classroomId);
    const userId = String(request.user.uid || '');

    const user = await fastify.prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        classroom: {
          include: {
            campus: true
          }
        },
        managedClasses: {
          include: {
            campus: true
          }
        }
      }
    });

    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }

    const rankingRows = (mockLeaderboard[scope] || mockLeaderboard.class)
      .slice(0, limit)
      .map((item) => ({ ...item }));

    const managedClasses = Array.isArray(user.managedClasses) ? user.managedClasses : [];
    const chosenManagedClass = managedClasses.find((item) => item.id === requestedClassroomId) || managedClasses[0] || null;
    const activeClassroom = user.role === 'TEACHER'
      ? chosenManagedClass
      : user.classroom;
    const activeCampus = activeClassroom && activeClassroom.campus
      ? activeClassroom.campus
      : (user.classroom && user.classroom.campus ? user.classroom.campus : null);

    const currentUser = buildCurrentUserRow(user, rankingRows);
    const topThree = ensureTopThree(rankingRows);

    return {
      code: 0,
      message: 'ok',
      data: {
        isMock: true,
        scope,
        context: {
          classroom: activeClassroom ? {
            id: activeClassroom.id,
            name: activeClassroom.name
          } : null,
          campus: activeCampus ? {
            id: activeCampus.id,
            name: activeCampus.name
          } : null
        },
        managedClassrooms: managedClasses.map((item) => ({
          id: item.id,
          name: item.name,
          campusId: item.campusId,
          campusName: item.campus ? item.campus.name : ''
        })),
        topThree,
        rankings: rankingRows,
        currentUser
      }
    };
  });
}

module.exports = leaderboardRoutes;
