const express = require('express');

/**
 * TA-side API. Owner: Harsh.
 *
 * Routes the stories add here (details in docs/architecture.md):
 *   RH-03  GET  /api/queue                   open doubts, oldest first
 *   RH-04  POST /api/doubts/:id/resolve      mark a doubt resolved
 *   RH-07  POST /api/doubts/:id/helping      mark the doubt the TA is walking to
 *   RH-10  POST /api/sessions                open a session and get a join code
 *          POST /api/sessions/:code/close    end a session
 *
 * Always use prepared statements on `db` (db.prepare(...).run/get/all with ?
 * placeholders). Never build SQL by joining strings.
 */
function taRoutes(db) {
  const router = express.Router();
  return router;
}

module.exports = taRoutes;
