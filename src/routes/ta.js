const express = require('express');
const {
  openQueue,
} = require('../queue');

/**
 * TA-side API. Owner: Harsh.
 */
function taRoutes(db) {
  const router = express.Router();

  // RH-03: open doubts, oldest first.
  router.get('/queue', (_req, res) => {
    res.json(openQueue(db, null));
  });

  return router;
}

module.exports = taRoutes;
