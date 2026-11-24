const express = require('express');
const { requireTa } = require('../sessions');

/**
 * RH-11: end-of-session stats. Owner: Shivansh.
 * Wait time is from raising a doubt to its resolution.
 */
function statsRoutes(db) {
  const router = express.Router();

  router.get('/sessions/:code/stats', requireTa(db), (req, res) => {
    const sessionId = req.labSession.id;
    const counts = db
      .prepare(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(status = 'resolved'), 0) AS handled,
                COALESCE(SUM(status = 'withdrawn'), 0) AS withdrawn,
                AVG(CASE WHEN status = 'resolved'
                         THEN (julianday(resolved_at) - julianday(created_at)) * 86400 END) AS wait
           FROM doubts WHERE session_id = ?`,
      )
      .get(sessionId);
    const top = db
      .prepare(
        'SELECT category, COUNT(*) AS n FROM doubts WHERE session_id = ? GROUP BY category ORDER BY n DESC, category LIMIT 1',
      )
      .get(sessionId);

    res.json({
      code: req.labSession.code,
      status: req.labSession.status,
      total: counts.total,
      handled: counts.handled,
      withdrawn: counts.withdrawn,
      averageWaitSeconds: counts.wait === null ? null : Math.round(counts.wait),
      topCategory: top ? top.category : null,
    });
  });

  return router;
}

module.exports = statsRoutes;
