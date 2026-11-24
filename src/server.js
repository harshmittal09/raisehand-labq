const { createApp } = require('./app');
const { openDatabase } = require('./db');

const port = Number(process.env.PORT) || 3000;
const db = openDatabase();

const server = createApp({ db }).listen(port, () => {
  console.log(`RaiseHand Lab.Q is listening on port ${port}`);
});

// Hosts stop the app with SIGTERM. Finish open requests and close the
// database cleanly so the queue file is never left half-written.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
