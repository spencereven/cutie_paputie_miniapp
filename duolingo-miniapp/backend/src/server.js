const { buildApp } = require('./app');

async function start() {
  const app = buildApp();
  const port = app.env.PORT;

  try {
    await app.listen({
      port,
      host: '0.0.0.0'
    });
    app.log.info(`backend running on ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
