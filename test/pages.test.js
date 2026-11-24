const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');

async function fetchText(app, path) {
  const res = await fetch(`${app.url}${path}`);
  return res.text();
}

test('the student page has the join form (RH-01)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/student.html');
  assert.match(html, /id="join-form"/);
  assert.match(html, /id="name"/);
  assert.match(html, /id="system"/);
});
