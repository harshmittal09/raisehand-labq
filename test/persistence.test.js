const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');
const { openLab, queue, raise, taAction } = require('./support/api');

test('the queue survives a server restart, in the same order, without resolved doubts (RH-05)', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'raisehand-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'queue.db');

  const before = await startTestServer({ file });
  const lab = await openLab(before);
  const asha = (await raise(before, lab)).body;
  await raise(before, lab, { studentName: 'Rohan', systemNo: 'L3-02' });
  await raise(before, lab, { studentName: 'Meera', systemNo: 'L3-21' });
  await taAction(before, lab, asha, 'resolve');
  await before.close();

  const after = await startTestServer({ file });
  t.after(after.close);
  const names = (await queue(after, lab)).body.map((doubt) => doubt.studentName);
  assert.deepEqual(names, ['Rohan', 'Meera']);
});
