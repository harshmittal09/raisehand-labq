const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { call, openLab, raise, taAction, withdraw } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

function stats(app, lab) {
  return call(app, 'GET', `/api/sessions/${lab.code}/stats`, { headers: lab.ta });
}

test('the summary shows doubts handled and withdrawn, the average wait and the top category (RH-11)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab, { studentName: 'Asha', systemNo: 'L3-14', category: 'logic' })).body;
  const rohan = (await raise(app, lab, { studentName: 'Rohan', systemNo: 'L3-02', category: 'compile-error' })).body;
  const meera = (await raise(app, lab, { studentName: 'Meera', systemNo: 'L3-21', category: 'logic' })).body;
  await raise(app, lab, { studentName: 'Dev', systemNo: 'L3-07', category: 'viva' });
  await taAction(app, lab, asha, 'resolve');
  await taAction(app, lab, meera, 'resolve');
  await withdraw(app, rohan);
  await call(app, 'POST', `/api/sessions/${lab.code}/close`, { headers: lab.ta });

  const res = await stats(app, lab);
  assert.equal(res.status, 200);
  assert.equal(res.body.total, 4);
  assert.equal(res.body.handled, 2);
  assert.equal(res.body.withdrawn, 1);
  assert.equal(res.body.topCategory, 'logic');
  assert.equal(typeof res.body.averageWaitSeconds, 'number');
  assert.ok(res.body.averageWaitSeconds >= 0);
});

test('a session with no doubts says so instead of failing (RH-11)', async (t) => {
  const { app, lab } = await setup(t);
  const res = await stats(app, lab);
  assert.equal(res.status, 200);
  assert.deepEqual(
    [res.body.total, res.body.handled, res.body.withdrawn, res.body.averageWaitSeconds, res.body.topCategory],
    [0, 0, 0, null, null],
  );
});

test("only the session's TA can see its stats (RH-11)", async (t) => {
  const { app, lab } = await setup(t);
  const other = await openLab(app);
  const res = await stats(app, { code: lab.code, ta: other.ta });
  assert.equal(res.status, 403);
});
