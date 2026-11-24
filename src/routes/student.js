const express = require('express');
const {
  findDoubtRow,
  positionOf,
  toDoubt,
} = require('../queue');
const { newToken, parseId, sameToken } = require('../tokens');
const { validateDoubt } = require('../validation');

/**
 * Student-side API. Owner: Shivansh.
 * A student proves a doubt is theirs with the token returned when they raised
 * it, sent back in the X-Doubt-Token header.
 */
function studentRoutes(db) {
  const router = express.Router();

  // RH-02: raise a doubt.
  router.post('/doubts', (req, res) => {
    const { value, error } = validateDoubt(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    const sessionId = null;

    const existing = db
      .prepare(
        "SELECT id FROM doubts WHERE session_id IS ? AND student_name = ? AND system_no = ? AND status IN ('waiting', 'helping')",
      )
      .get(sessionId, value.studentName, value.systemNo);
    if (existing) {
      return res.status(409).json({
        error: 'You already have a doubt in the queue. Wait for it, or withdraw it first.',
      });
    }

    const token = newToken();
    const { lastInsertRowid } = db
      .prepare(
        'INSERT INTO doubts (session_id, student_name, system_no, category, description, token) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(sessionId, value.studentName, value.systemNo, value.category, value.description, token);

    const row = findDoubtRow(db, Number(lastInsertRowid));
    return res.status(201).json({
      ...toDoubt(row),
      position: positionOf(db, row),
      token,
    });
  });

  // RH-02: a student checks on their own doubt.
  router.get('/doubts/:id', (req, res) => {
    const row = findDoubtRow(db, parseId(req.params.id));
    if (!row) {
      return res.status(404).json({ error: 'No doubt has that id.' });
    }
    if (!sameToken(row.token, req.get('X-Doubt-Token'))) {
      return res.status(403).json({ error: 'That doubt belongs to someone else.' });
    }
    return res.json({
      ...toDoubt(row),
      position: positionOf(db, row),
    });
  });

  return router;
}

module.exports = studentRoutes;
