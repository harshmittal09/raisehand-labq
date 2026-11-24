const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { call, openLab, queue, raise, taAction } = require('./support/api');

async function server(t) {
  const app = await startTestServer();
  t.after(app.close);
  return app;
}

test('a TA starts a session and gets a 4-character join code (RH-10)', async (t) => {
  const app = await server(t);
  const res = await call(app, 'POST', '/api/sessions');
  assert.equal(res.status, 201);
  assert.match(res.body.code, /^[A-HJ-NP-Z2-9]{4}$/);
  assert.equal(typeof res.body.taToken, 'string');
});

test('students can check a code before joining, in any letter case (RH-10)', async (t) => {
  const app = await server(t);
  const lab = await openLab(app);
  assert.equal((await call(app, 'GET', `/api/sessions/${lab.code.toLowerCase()}`)).status, 200);
  const unknown = await call(app, 'GET', '/api/sessions/QQQQ');
  assert.equal(unknown.status, 404);
  assert.match(unknown.body.error, /No open session/);
});

test('a doubt raised with a code that is not open is refused (RH-10)', async (t) => {
  const app = await server(t);
  const res = await raise(app, { code: 'QQQQ' });
  assert.equal(res.status, 404);
});

test('each session has its own queue (RH-10)', async (t) => {
  const app = await server(t);
  const labA = await openLab(app);
  const labB = await openLab(app);
  await raise(app, labA, { studentName: 'Asha', systemNo: 'L3-14' });
  await raise(app, labB, { studentName: 'Rohan', systemNo: 'L4-02' });
  assert.deepEqual(
    (await queue(app, labA)).body.map((doubt) => doubt.studentName),
    ['Asha'],
  );
});

test("only the session's TA sees its queue and acts on its doubts (RH-10)", async (t) => {
  const app = await server(t);
  const labA = await openLab(app);
  const labB = await openLab(app);
  const asha = (await raise(app, labA)).body;
  assert.equal((await queue(app, { code: labA.code, ta: labB.ta })).status, 403);
  assert.equal((await taAction(app, labB, asha, 'resolve')).status, 403);
  assert.equal((await taAction(app, labA, asha, 'resolve')).status, 204);
});

test('after a session ends, nobody can raise new doubts in it (RH-10)', async (t) => {
  const app = await server(t);
  const lab = await openLab(app);
  const closed = await call(app, 'POST', `/api/sessions/${lab.code}/close`, { headers: lab.ta });
  assert.equal(closed.status, 204);
  assert.equal((await raise(app, lab)).status, 404);
  assert.equal((await call(app, 'GET', `/api/sessions/${lab.code}`)).status, 404);
});
