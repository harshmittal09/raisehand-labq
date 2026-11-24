const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { check, openLab, raise, taAction } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

test('a student sees their place, and it moves up when someone ahead is resolved (RH-06)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab, { studentName: 'Asha', systemNo: 'L3-14' })).body;
  await raise(app, lab, { studentName: 'Rohan', systemNo: 'L3-02' });
  await raise(app, lab, { studentName: 'Meera', systemNo: 'L3-21' });
  const dev = await raise(app, lab, { studentName: 'Dev', systemNo: 'L3-07' });
  assert.equal(dev.body.position, 4);

  await taAction(app, lab, asha, 'resolve');
  const seen = await check(app, dev.body);
  assert.equal(seen.body.position, 3);
});

test('a resolved doubt has no place in the queue (RH-06)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await taAction(app, lab, asha, 'resolve');
  const seen = await check(app, asha);
  assert.equal(seen.body.position, null);
});
