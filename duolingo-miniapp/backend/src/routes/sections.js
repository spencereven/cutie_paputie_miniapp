const sections = require('../mocks/sections');

async function sectionRoutes(fastify) {
  fastify.get('/sections', { preHandler: [fastify.authenticate] }, async () => {
    return {
      code: 0,
      message: 'ok',
      data: sections
    };
  });

  fastify.get('/sections/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const sectionId = Number(request.params.id);
    const section = sections.find((item) => item.id === sectionId) || null;
    if (!section) {
      return reply.code(404).send({
        code: 40030,
        message: 'section_not_found',
        data: null
      });
    }

    return {
      code: 0,
      message: 'ok',
      data: section
    };
  });
}

module.exports = sectionRoutes;
