const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');

test('GET /api/health answers ok', async (t) => {
  const app = await startTestServer();
  t.after(app.close);

  const res = await fetch(`${app.url}/api/health`);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('an unknown API path returns a JSON 404', async (t) => {
  const app = await startTestServer();
  t.after(app.close);

  const res = await fetch(`${app.url}/api/does-not-exist`);

  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});

test('the home, student and TA pages are served', async (t) => {
  const app = await startTestServer();
  t.after(app.close);

  for (const page of ['/', '/student.html', '/ta.html']) {
    const res = await fetch(`${app.url}${page}`);
    await res.text();
    assert.equal(res.status, 200, `${page} should load`);
  }
});
