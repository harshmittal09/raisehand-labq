const crypto = require('node:crypto');
const { newToken, sameToken } = require('./tokens');

// No I, O, 0 or 1, so a code is easy to read off a projector.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newCode() {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

/** Opens a session with a fresh join code and a secret for the TA. */
function createSession(db) {
  const taToken = newToken();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = newCode();
    const taken = db.prepare('SELECT 1 FROM sessions WHERE code = ?').get(code);
    if (!taken) {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO sessions (code, ta_token) VALUES (?, ?)')
        .run(code, taToken);
      return { id: Number(lastInsertRowid), code, taToken };
    }
  }
  throw new Error('Could not find a free session code');
}

function findSession(db, code) {
  if (typeof code !== 'string' || code.trim() === '') {
    return null;
  }
  return db.prepare('SELECT * FROM sessions WHERE code = ?').get(code.trim().toUpperCase()) ?? null;
}

function findOpenSession(db, code) {
  const session = findSession(db, code);
  return session && session.status === 'open' ? session : null;
}

/**
 * Middleware for TA-only routes. The session comes from :code or ?session=,
 * and the X-TA-Token header must match the secret handed out when it opened.
 */
function requireTa(db) {
  return (req, res, next) => {
    const session = findSession(db, req.params.code ?? req.query.session);
    if (!session) {
      return res.status(404).json({ error: 'No session has that code.' });
    }
    if (!sameToken(session.ta_token, req.get('X-TA-Token'))) {
      return res.status(403).json({ error: 'Only the TA who started this session can do that.' });
    }
    req.labSession = session;
    return next();
  };
}

/** True when the token belongs to the TA of the doubt's session. */
function isTaFor(db, row, token) {
  if (row.session_id === null) {
    return false;
  }
  const session = db.prepare('SELECT ta_token FROM sessions WHERE id = ?').get(row.session_id);
  return Boolean(session) && sameToken(session.ta_token, token);
}

module.exports = { createSession, findSession, findOpenSession, requireTa, isTaFor };
