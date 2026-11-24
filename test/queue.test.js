const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { openLab, queue, raise } = require('./support/api');

test('the TA sees open doubts oldest first, with who, where, what and when (RH-03)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const lab = await openLab(app);
  await raise(app, lab, { studentName: 'Asha', systemNo: 'L3-14' });
  await raise(app, lab, {
    studentName: 'Rohan',
    systemNo: 'L3-02',
    category: 'compile-error',
    description: 'Segfault on line 12',
  });
  await raise(app, lab, { studentName: 'Meera', systemNo: 'L3-21', category: 'viva', description: 'Stack vs heap?' });

  const res = await queue(app, lab);
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.body.map((doubt) => doubt.studentName),
    ['Asha', 'Rohan', 'Meera'],
  );
  const [first] = res.body;
  assert.equal(first.systemNo, 'L3-14');
  assert.equal(first.category, 'logic');
  assert.equal(first.description, 'My loop never ends');
  assert.ok(Date.parse(first.createdAt));
});

test('the queue is empty before anyone raises a doubt (RH-03)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const lab = await openLab(app);
  const res = await queue(app, lab);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, []);
});
