const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase } = require('../src/db');

test('the database creates the sessions and doubts tables', (t) => {
  const db = openDatabase(':memory:');
  t.after(() => db.close());

  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => row.name);

  assert.ok(names.includes('sessions'));
  assert.ok(names.includes('doubts'));
});

test('a new doubt starts as waiting', (t) => {
  const db = openDatabase(':memory:');
  t.after(() => db.close());

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO doubts (student_name, system_no, category, description) VALUES (?, ?, ?, ?)',
    )
    .run('Asha', 'L3-14', 'logic', 'My loop never ends');

  const doubt = db.prepare('SELECT status FROM doubts WHERE id = ?').get(lastInsertRowid);
  assert.equal(doubt.status, 'waiting');
});

test('the database refuses a status that does not exist', (t) => {
  const db = openDatabase(':memory:');
  t.after(() => db.close());

  const insert = db.prepare(
    'INSERT INTO doubts (student_name, system_no, category, description, status) VALUES (?, ?, ?, ?, ?)',
  );

  assert.throws(() => insert.run('Asha', 'L3-14', 'logic', 'x', 'lost'));
});
