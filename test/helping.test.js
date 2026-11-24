const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { check, openLab, queue, raise, taAction } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

test('"helping now" shows the student that the TA is on the way (RH-07)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  const res = await taAction(app, lab, asha, 'helping');
  assert.equal(res.status, 204);

  const seen = await check(app, asha);
  assert.equal(seen.body.status, 'helping');
  assert.ok(Date.parse(seen.body.helpingAt));
  assert.equal((await queue(app, lab)).body[0].status, 'helping');
});

test('only one doubt is "helping now"; the previous one goes back to waiting in its place (RH-07)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab, { studentName: 'Asha', systemNo: 'L3-14' })).body;
  await raise(app, lab, { studentName: 'Rohan', systemNo: 'L3-02' });
  const meera = (await raise(app, lab, { studentName: 'Meera', systemNo: 'L3-21' })).body;

  await taAction(app, lab, asha, 'helping');
  await taAction(app, lab, meera, 'helping');

  const list = (await queue(app, lab)).body;
  assert.deepEqual(
    list.map((doubt) => `${doubt.studentName}:${doubt.status}`),
    ['Asha:waiting', 'Rohan:waiting', 'Meera:helping'],
  );
});

test('a doubt being helped is resolved as usual, and a closed doubt cannot be helped (RH-07)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await taAction(app, lab, asha, 'helping');
  assert.equal((await taAction(app, lab, asha, 'resolve')).status, 204);
  assert.equal((await taAction(app, lab, asha, 'helping')).status, 409);
});
