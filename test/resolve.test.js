const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { check, openLab, queue, raise, taAction } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

test('resolving a doubt takes it out of the queue and saves when it was resolved (RH-04)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await raise(app, lab, { studentName: 'Rohan', systemNo: 'L3-02' });

  const res = await taAction(app, lab, asha, 'resolve');
  assert.equal(res.status, 204);
  const names = (await queue(app, lab)).body.map((doubt) => doubt.studentName);
  assert.deepEqual(names, ['Rohan']);

  const seen = await check(app, asha);
  assert.equal(seen.body.status, 'resolved');
  assert.ok(Date.parse(seen.body.resolvedAt));
});

test('after a resolution the student can raise a new doubt (RH-04)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await taAction(app, lab, asha, 'resolve');
  const again = await raise(app, lab, { description: 'A new doubt' });
  assert.equal(again.status, 201);
});

test('resolving twice, or resolving a doubt that does not exist, is refused (RH-04)', async (t) => {
  const { app, lab } = await setup(t);
  const asha = (await raise(app, lab)).body;
  await taAction(app, lab, asha, 'resolve');
  const twice = await taAction(app, lab, asha, 'resolve');
  assert.equal(twice.status, 409);
  const missing = await taAction(app, lab, { id: 9999 }, 'resolve');
  assert.equal(missing.status, 404);
});
