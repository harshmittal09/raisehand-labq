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
 * The lab. Until sessions exist (RH-10) there is one shared queue.
 */
async function openLab(app) {
  return { url: app.url, code: null, ta: {} };
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

module.exports = {
  call,
  openLab,
  raise,
  check,
};
