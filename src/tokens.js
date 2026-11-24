const crypto = require('node:crypto');

/** A random secret handed to whoever created a doubt or a session. */
function newToken() {
  return crypto.randomUUID();
}

/** Compares a stored secret with one from a request, in constant time. */
function sameToken(expected, given) {
  if (typeof expected !== 'string' || typeof given !== 'string') {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Route ids must be positive whole numbers; anything else finds nothing. */
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { newToken, sameToken, parseId };
