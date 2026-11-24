const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/server');

async function fetchText(app, path) {
  const res = await fetch(`${app.url}${path}`);
  return res.text();
}

test('the student page has the join form (RH-01)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/student.html');
  assert.match(html, /id="join-form"/);
  assert.match(html, /id="name"/);
  assert.match(html, /id="system"/);
  assert.match(html, /id="code"/);
});

test('the TA page has the queue (RH-03)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/ta.html');
  assert.match(html, /id="queue"/);
});

test('the student page is set up for phone screens (RH-12)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/student.html');
  const css = await fetchText(app, '/styles.css');
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(css, /@media \(max-width: 480px\)/);
});

test('the TA page can filter the queue by category (RH-14)', async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/ta.html');
  assert.match(html, /id="filter"/);
});

test("the student page has the you're-next banner (RH-15)", async (t) => {
  const app = await startTestServer();
  t.after(app.close);
  const html = await fetchText(app, '/student.html');
  assert.match(html, /id="next-banner"/);
});
