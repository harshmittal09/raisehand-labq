const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { check, openLab, raise } = require('./support/api');

async function setup(t) {
  const app = await startTestServer();
  t.after(app.close);
  return { app, lab: await openLab(app) };
}

test('a student raises a doubt and sees they are in the queue (RH-02)', async (t) => {
  const { app, lab } = await setup(t);
  const raised = await raise(app, lab);
  assert.equal(raised.status, 201);
  assert.equal(raised.body.status, 'waiting');
  assert.equal(typeof raised.body.token, 'string');

  const seen = await check(app, raised.body);
  assert.equal(seen.status, 200);
  assert.equal(seen.body.status, 'waiting');
  assert.equal(seen.body.description, 'My loop never ends');
  assert.equal(seen.body.token, undefined);
});

test('a doubt needs a name, system number, category and a description of up to 140 characters (RH-02)', async (t) => {
  const { app, lab } = await setup(t);
  const cases = [
    [{ studentName: '  ' }, /name/],
    [{ systemNo: '' }, /system number/],
    [{ category: 'cooking' }, /category/],
    [{ description: '   ' }, /Describe/],
    [{ description: 'x'.repeat(141) }, /140/],
  ];
  for (const [fields, message] of cases) {
    const res = await raise(app, lab, fields);
    assert.equal(res.status, 400);
    assert.match(res.body.error, message);
  }
  const longest = await raise(app, lab, { description: 'y'.repeat(140) });
  assert.equal(longest.status, 201);
});

test('a student with an open doubt is told to wait or withdraw it first (RH-02)', async (t) => {
  const { app, lab } = await setup(t);
  await raise(app, lab);
  const again = await raise(app, lab, { description: 'Another one' });
  assert.equal(again.status, 409);
  assert.match(again.body.error, /withdraw/);
});

test('only the student who raised a doubt can check on it (RH-02)', async (t) => {
  const { app, lab } = await setup(t);
  const raised = await raise(app, lab);
  const wrong = await check(app, { id: raised.body.id, token: 'not-the-token' });
  assert.equal(wrong.status, 403);
  const missing = await check(app, { id: 9999, token: raised.body.token });
  assert.equal(missing.status, 404);
});
