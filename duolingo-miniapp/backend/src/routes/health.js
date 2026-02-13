async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    return {
      code: 0,
      message: 'ok',
      data: {
        status: 'up',
        time: new Date().toISOString()
      }
    };
  });
}

module.exports = healthRoutes;
