// TA page. Owner: Harsh.

const POLL_MS = 3000;
const CATEGORY_NAMES = {
  'compile-error': 'Compile error',
  logic: 'Logic',
  viva: 'Viva prep',
  other: 'Other',
};
const SESSION_KEY = 'raisehand.ta-session';
const FILTER_KEY = 'raisehand.ta-filter';

const $ = (id) => document.getElementById(id);

const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be blocked (private mode). The page still works until a reload.
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Same as above.
    }
  },
};

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
  const session = store.get(SESSION_KEY);
  return session ? { 'X-TA-Token': session.taToken } : {};
}

let lastQueue = [];

function renderQueue(doubts) {
  lastQueue = doubts;
  const filter = $('filter').value;
  const shown = filter ? doubts.filter((doubt) => doubt.category === filter) : doubts;
  $('queue-title').textContent = doubts.length === 0 ? 'Queue' : `Queue: ${doubts.length} open`;
  $('queue-empty').hidden = shown.length > 0;
  $('queue-empty').textContent =
    doubts.length > 0 ? 'No doubts in this category right now.' : 'No doubts yet. They appear here as students raise them.';
  $('queue').replaceChildren(...shown.map((doubt) => queueItem(doubt, doubts.indexOf(doubt) + 1)));
}

function queueItem(doubt, position) {
  const item = el('li', 'queue-item');
  const helping = doubt.status === 'helping';
  if (helping) {
    item.classList.add('is-helping');
  }
  const when = helping ? `Helping now. Raised ${ago(doubt.createdAt)}` : `Raised ${ago(doubt.createdAt)}`;
  const details = el('div', 'queue-details');
  details.append(
    el('p', 'queue-who', `${doubt.studentName}, ${doubt.systemNo}`),
    el('p', 'queue-what', `${CATEGORY_NAMES[doubt.category] ?? doubt.category}: ${doubt.description}`),
    el('p', 'queue-when', when),
  );
  const actions = el('div', 'queue-actions');
  if (!helping) {
    actions.append(button('Helping now', 'secondary', () => act(doubt.id, 'helping')));
  }
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
  const session = store.get(SESSION_KEY);
  if (!session) {
    return;
  }
  const res = await request(`/api/queue?session=${encodeURIComponent(session.code)}`, { headers: taHeaders() });
  if (!res.ok) {
    $('queue-error').textContent = res.data.error ?? 'Could not load the queue.';
    return;
  }
  $('queue-error').textContent = '';
  renderQueue(res.data);
}

// RH-10: lab sessions with join codes.
function renderSession() {
  const session = store.get(SESSION_KEY);
  $('no-session').hidden = Boolean(session);
  $('live-session').hidden = !session;
  $('queue-panel').hidden = !session;
  if (session) {
    $('session-code').textContent = session.code;
  }
}

$('start').addEventListener('click', async () => {
  const res = await request('/api/sessions', { method: 'POST' });
  if (!res.ok) {
    $('session-error').textContent = res.data.error ?? 'Could not start a session. Try again.';
    return;
  }
  store.set(SESSION_KEY, { code: res.data.code, taToken: res.data.taToken });
  $('session-error').textContent = '';
  $('summary').hidden = true;
  renderSession();
  await loadQueue();
});

$('end').addEventListener('click', async () => {
  const session = store.get(SESSION_KEY);
  if (!session || !window.confirm("End this session? Students won't be able to raise new doubts in it.")) {
    return;
  }
  const res = await request(`/api/sessions/${encodeURIComponent(session.code)}/close`, {
    method: 'POST',
    headers: taHeaders(),
  });
  if (!res.ok) {
    $('queue-error').textContent = res.data.error ?? 'Could not end the session. Try again.';
    return;
  }
  await showSummary(session);
  store.remove(SESSION_KEY);
  renderSession();
});

// RH-11: end-of-session stats.
function formatWait(seconds) {
  if (seconds === null) {
    return 'None resolved';
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes === 0 ? `${rest} s` : `${minutes} min ${rest} s`;
}

async function showSummary(session) {
  const res = await request(`/api/sessions/${encodeURIComponent(session.code)}/stats`, { headers: taHeaders() });
  if (!res.ok) {
    return;
  }
  const stats = res.data;
  $('summary-empty').hidden = stats.total > 0;
  $('summary-stats').hidden = stats.total === 0;
  $('stat-handled').textContent = String(stats.handled);
  $('stat-withdrawn').textContent = String(stats.withdrawn);
  $('stat-wait').textContent = formatWait(stats.averageWaitSeconds);
  $('stat-top').textContent = stats.topCategory ? (CATEGORY_NAMES[stats.topCategory] ?? stats.topCategory) : 'None';
  $('summary').hidden = false;
}

// RH-14: filter the queue by category. The choice survives a reload.
$('filter').value = store.get(FILTER_KEY) ?? '';
$('filter').addEventListener('change', () => {
  store.set(FILTER_KEY, $('filter').value);
  renderQueue(lastQueue);
});

renderSession();
loadQueue();
setInterval(() => {
  if (document.visibilityState === 'visible') {
    loadQueue();
  }
}, POLL_MS);
