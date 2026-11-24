const { once } = require('node:events');
const { createApp } = require('../../src/app');
const { openDatabase } = require('../../src/db');

/**
 * Starts the app on a free port with a fresh in-memory database.
 * Returns the base URL, the database and a close() function for t.after().
 */
async function startTestServer() {
  const db = openDatabase(':memory:');
  const server = createApp({ db }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  return {
    url: `http://127.0.0.1:${port}`,
    db,
    close: () =>
      new Promise((resolve) => {
        server.close(() => {
          db.close();
          resolve();
        });
        server.closeAllConnections();
      }),
  };
}

module.exports = { startTestServer };
