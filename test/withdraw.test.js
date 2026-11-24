const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { check, openLab, queue, raise, taAction, withdraw } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

test('a student withdraws their doubt and everyone behind moves up (RH-08)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab, { studentName: 'Asha', systemNo: 'L3-14' })).body;
  const rohan = (await raise(app, lab, { studentName: 'Rohan', systemNo: 'L3-02' })).body;

  assert.equal((await withdraw(app, asha)).status, 204);
  assert.equal((await check(app, rohan)).body.position, 1);
  assert.deepEqual(
    (await queue(app, lab)).body.map((doubt) => doubt.studentName),
    ['Rohan'],
  );
});

test('only the student who raised a doubt can withdraw it (RH-08)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  const res = await withdraw(app, asha, 'someone-else');
  assert.equal(res.status, 403);
});

test('a doubt the TA is helping can still be withdrawn, and leaves the TA list (RH-08)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await taAction(app, lab, asha, 'helping');
  assert.equal((await withdraw(app, asha)).status, 204);
  assert.deepEqual((await queue(app, lab)).body, []);
  assert.equal((await withdraw(app, asha)).status, 409);
});
