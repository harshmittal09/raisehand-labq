/**
 * Small helpers so each story's tests read like its acceptance criteria.
 */

async function call(app, method, path, { body, headers = {} } = {}) {
  const res = await fetch(`${app.url}${path}`, {
    method,
    headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

/**
 * The lab: a session a TA opened, with its join code and the TA's secret.
 */
async function openLab(app) {
  const res = await call(app, 'POST', '/api/sessions');
  return { code: res.body.code, ta: { 'X-TA-Token': res.body.taToken } };
}

const SAMPLE = { studentName: 'Asha', systemNo: 'L3-14', category: 'logic', description: 'My loop never ends' };

function raise(app, lab, fields = {}) {
  const body = { ...SAMPLE, ...fields };
  if (lab.code) {
    body.sessionCode = lab.code;
  }
  return call(app, 'POST', '/api/doubts', { body });
}

function check(app, doubt) {
  return call(app, 'GET', `/api/doubts/${doubt.id}`, { headers: { 'X-Doubt-Token': doubt.token } });
}

function queue(app, lab) {
  const path = lab.code ? `/api/queue?session=${lab.code}` : '/api/queue';
  return call(app, 'GET', path, { headers: lab.ta });
}

function taAction(app, lab, doubt, action) {
  return call(app, 'POST', `/api/doubts/${doubt.id}/${action}`, { headers: lab.ta });
}

function withdraw(app, doubt, token = doubt.token) {
  return call(app, 'POST', `/api/doubts/${doubt.id}/withdraw`, { headers: { 'X-Doubt-Token': token } });
}

module.exports = {
  call,
  openLab,
  raise,
  check,
  queue,
  taAction,
  withdraw,
};
