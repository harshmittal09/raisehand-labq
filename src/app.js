const path = require('node:path');
const express = require('express');
const { openDatabase } = require('./db');
const statsRoutes = require('./routes/stats');
const studentRoutes = require('./routes/student');
const taRoutes = require('./routes/ta');

/**
 * Builds the Express app. Tests pass their own in-memory database.
 */
function createApp({ db = openDatabase() } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', studentRoutes(db));
  app.use('/api', taRoutes(db));
  app.use('/api', statsRoutes(db));

  // Any /api path that no route handled gets a JSON 404, not an HTML page.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Errors come back as JSON. Unexpected ones are logged and hidden from the client.
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) {
      console.error(err);
    }
    res.status(status).json({ error: status >= 500 ? 'Something went wrong' : err.message });
  });

  return app;
}

module.exports = { createApp };
