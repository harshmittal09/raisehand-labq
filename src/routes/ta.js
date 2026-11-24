const express = require('express');
const {
  NOW,
  findDoubtRow,
  isOpen,
  openQueue,
} = require('../queue');
const { parseId } = require('../tokens');

/**
 * TA-side API. Owner: Harsh.
 */
function taRoutes(db) {
  const router = express.Router();

  /** Finds the doubt for a TA action, or answers the request with the problem. */
  function doubtForTa(req, res) {
    const row = findDoubtRow(db, parseId(req.params.id));
    if (!row) {
      res.status(404).json({ error: 'No doubt has that id.' });
      return null;
    }
    if (!isOpen(row)) {
      res.status(409).json({ error: 'This doubt is already closed.' });
      return null;
    }
    return row;
  }

  // RH-03: open doubts, oldest first.
  router.get('/queue', (_req, res) => {
    res.json(openQueue(db, null));
  });

  // RH-04: mark a doubt resolved.
  router.post('/doubts/:id/resolve', (req, res) => {
    const row = doubtForTa(req, res);
    if (!row) {
      return undefined;
    }
    db.prepare(`UPDATE doubts SET status = 'resolved', resolved_at = ${NOW} WHERE id = ?`).run(row.id);
    return res.status(204).end();
  });

  // RH-07: mark the doubt the TA is walking over to. Only one at a time;
  // the previous one goes back to waiting in its original place.
  router.post('/doubts/:id/helping', (req, res) => {
    const row = doubtForTa(req, res);
    if (!row) {
      return undefined;
    }
    if (row.status === 'helping') {
      return res.status(204).end();
    }
    db.exec('BEGIN');
    try {
      db.prepare(
        "UPDATE doubts SET status = 'waiting', helping_at = NULL WHERE session_id IS ? AND status = 'helping'",
      ).run(row.session_id);
      db.prepare(`UPDATE doubts SET status = 'helping', helping_at = ${NOW} WHERE id = ?`).run(row.id);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    return res.status(204).end();
  });

  return router;
}

module.exports = taRoutes;
