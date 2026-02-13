function normalizeActorRole(role) {
  if (role === 'ADMIN' || role === 'TEACHER' || role === 'STUDENT') return role;
  return null;
}

async function recordAdminAction(fastify, payload) {
  if (!fastify || !fastify.prisma || !payload) return;

  const action = String(payload.action || '').trim();
  const targetType = String(payload.targetType || '').trim();
  if (!action || !targetType) return;

  const actorUserId = payload.actorUserId ? String(payload.actorUserId).trim() : null;
  const actorRole = normalizeActorRole(payload.actorRole);
  const targetId = payload.targetId === undefined || payload.targetId === null
    ? null
    : String(payload.targetId).trim();
  const detailJson = payload.detail === undefined ? null : payload.detail;

  try {
    await fastify.prisma.adminActionLog.create({
      data: {
        actorUserId: actorUserId || null,
        actorRole,
        action,
        targetType,
        targetId: targetId || null,
        detailJson
      }
    });
  } catch (err) {
    if (fastify.log && typeof fastify.log.warn === 'function') {
      fastify.log.warn({ err, action, targetType }, 'record_admin_action_failed');
    }
  }
}

module.exports = {
  recordAdminAction
};
