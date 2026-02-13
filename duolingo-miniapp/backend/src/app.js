const fastifyFactory = require('fastify');
const cors = require('@fastify/cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();
const env = require('./utils/env');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const sectionRoutes = require('./routes/sections');
const leaderboardRoutes = require('./routes/leaderboard');
const lessonsRoutes = require('./routes/lessons');
const classroomsRoutes = require('./routes/classrooms');
const uploadsRoutes = require('./routes/uploads');
const adminWebRoutes = require('./routes/admin-web');

function buildApp() {
  const fastify = fastifyFactory({
    logger: true,
    // Base64 JSON payload is larger than source file bytes.
    bodyLimit: env.BODY_LIMIT_BYTES
  });
  const prisma = new PrismaClient();

  fastify.decorate('env', env);
  fastify.decorate('prisma', prisma);

  fastify.register(cors, {
    origin: true
  });
  fastify.register(require('@fastify/jwt'), {
    secret: env.JWT_SECRET
  });
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({
        code: 40001,
        message: 'invalid_token',
        data: null
      });
    }
  });

  fastify.register(healthRoutes, { prefix: '/api/v1' });
  fastify.register(authRoutes, { prefix: '/api/v1' });
  fastify.register(userRoutes, { prefix: '/api/v1' });
  fastify.register(sectionRoutes, { prefix: '/api/v1' });
  fastify.register(leaderboardRoutes, { prefix: '/api/v1' });
  fastify.register(lessonsRoutes, { prefix: '/api/v1' });
  fastify.register(classroomsRoutes, { prefix: '/api/v1' });
  fastify.register(uploadsRoutes, { prefix: '/api/v1' });
  fastify.register(adminWebRoutes);

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.code(error.statusCode || 500).send({
      code: 50000,
      message: 'internal_server_error',
      data: null
    });
  });

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });

  return fastify;
}

module.exports = {
  buildApp
};
