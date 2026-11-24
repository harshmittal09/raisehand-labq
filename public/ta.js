// TA page. Owner: Harsh.

const POLL_MS = 3000;
const CATEGORY_NAMES = {
  'compile-error': 'Compile error',
  logic: 'Logic',
  viva: 'Viva prep',
  other: 'Other',
};

const $ = (id) => document.getElementById(id);

async function request(url, { method = 'GET', body, headers = {} } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : {} };
  } catch {
    return { ok: false, status: 0, data: { error: "Can't reach the server. Check your connection and try again." } };
  }
}

/** Builds an element with plain text, so student-written text is never parsed as HTML. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function button(label, className, onClick) {
  const node = el('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function ago(iso) {
  const minutes = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  return minutes < 1 ? 'just now' : `${minutes} min ago`;
}

function taHeaders() {
  return {};
}

function renderQueue(doubts) {
  const shown = doubts;
  $('queue-title').textContent = doubts.length === 0 ? 'Queue' : `Queue: ${doubts.length} open`;
  $('queue-empty').hidden = shown.length > 0;
  $('queue').replaceChildren(...shown.map((doubt) => queueItem(doubt, doubts.indexOf(doubt) + 1)));
}

function queueItem(doubt, position) {
  const item = el('li', 'queue-item');
  const when = `Raised ${ago(doubt.createdAt)}`;
  const details = el('div', 'queue-details');
  details.append(
    el('p', 'queue-who', `${doubt.studentName}, ${doubt.systemNo}`),
    el('p', 'queue-what', `${CATEGORY_NAMES[doubt.category] ?? doubt.category}: ${doubt.description}`),
    el('p', 'queue-when', when),
  );
  const actions = el('div', 'queue-actions');
  actions.append(button('Resolve', '', () => act(doubt.id, 'resolve')));
  item.append(el('span', 'queue-number', String(position)), details, actions);
  return item;
}

async function act(id, action) {
  const res = await request(`/api/doubts/${id}/${action}`, { method: 'POST', headers: taHeaders() });
  $('queue-error').textContent = res.ok ? '' : (res.data.error ?? "That didn't work. Try again.");
  await loadQueue();
}

async function loadQueue() {
  const res = await request('/api/queue', { headers: taHeaders() });
  if (!res.ok) {
    $('queue-error').textContent = res.data.error ?? 'Could not load the queue.';
    return;
  }
  $('queue-error').textContent = '';
  renderQueue(res.data);
}
loadQueue();
setInterval(() => {
  if (document.visibilityState === 'visible') {
    loadQueue();
  }
}, POLL_MS);
