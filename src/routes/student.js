const express = require('express');

/**
 * Student-side API. Owner: Shivansh.
 *
 * Routes the stories add here (details in docs/architecture.md):
 *   RH-02  POST /api/doubts               raise a doubt
 *   RH-06  GET  /api/doubts/:id           status and live position
 *   RH-08  POST /api/doubts/:id/withdraw  withdraw a doubt
 *
 * Always use prepared statements on `db` (db.prepare(...).run/get/all with ?
 * placeholders). Never build SQL by joining strings.
 */
function studentRoutes(db) {
  const router = express.Router();
  return router;
}

module.exports = studentRoutes;
