const fs = require('node:fs/promises');
const path = require('node:path');

const WEB_ROOT = path.join(__dirname, '..', 'admin-web');
const PAGE_FILES = {
  index: 'dashboard.html',
  login: 'login.html',
  dashboard: 'dashboard.html',
  classrooms: 'classrooms.html',
  lessons: 'lessons.html',
  uploads: 'uploads.html'
};
const ASSET_FILES = {
  'styles.css': 'text/css; charset=utf-8',
  'app.js': 'application/javascript; charset=utf-8'
};

async function sendStatic(reply, filepath, contentType) {
  try {
    const content = await fs.readFile(filepath);
    reply.type(contentType);
    return reply.send(content);
  } catch (err) {
    return reply.code(404).send('Not Found');
  }
}

async function adminWebRoutes(fastify) {
  fastify.get('/admin', async (_request, reply) => {
    return sendStatic(reply, path.join(WEB_ROOT, PAGE_FILES.dashboard), 'text/html; charset=utf-8');
  });

  fastify.get('/admin/', async (_request, reply) => {
    return sendStatic(reply, path.join(WEB_ROOT, PAGE_FILES.dashboard), 'text/html; charset=utf-8');
  });

  Object.entries(PAGE_FILES).forEach(([pageName, fileName]) => {
    fastify.get(`/admin/${pageName}`, async (_request, reply) => {
      return sendStatic(reply, path.join(WEB_ROOT, fileName), 'text/html; charset=utf-8');
    });
    fastify.get(`/admin/${pageName}/`, async (_request, reply) => {
      return sendStatic(reply, path.join(WEB_ROOT, fileName), 'text/html; charset=utf-8');
    });
  });

  Object.entries(ASSET_FILES).forEach(([assetName, contentType]) => {
    fastify.get(`/admin/${assetName}`, async (_request, reply) => {
      return sendStatic(reply, path.join(WEB_ROOT, assetName), contentType);
    });
  });
}

module.exports = adminWebRoutes;
