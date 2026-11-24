// Student page. Owner: Shivansh.
// What the student enters is remembered in this browser (localStorage).

const STUDENT_KEY = 'raisehand.student';
const DOUBT_KEY = 'raisehand.doubt';
const CATEGORY_NAMES = {
  'compile-error': 'Compile error',
  logic: 'Logic',
  viva: 'Viva prep',
  other: 'Other',
};
const POLL_MS = 3000;
const TITLE = document.title;

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

function show(view) {
  for (const id of ['join', 'raise', 'status', 'resolved']) {
    const section = $(id);
    if (section) {
      section.hidden = id !== view;
    }
  }
}

function listOf(items) {
  return items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

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

/** Picks the view from what this browser remembers, then asks for the doubt's latest state. */
async function refresh() {
  const student = store.get(STUDENT_KEY);
  if (!student) {
    show('join');
    return;
  }
  $('who').textContent = `${student.name}, system ${student.systemNo}`;
  const saved = store.get(DOUBT_KEY);
  if (!saved) {
    show('raise');
    return;
  }
  const res = await request(`/api/doubts/${saved.id}`, { headers: { 'X-Doubt-Token': saved.token } });
  if (res.status === 404 || res.status === 403) {
    store.remove(DOUBT_KEY);
    show('raise');
    return;
  }
  if (res.ok) {
    renderDoubt(res.data);
  }
}

function renderDoubt(doubt) {
  if (doubt.status === 'resolved') {
    store.remove(DOUBT_KEY);
    showNext(false);
    show('resolved');
    return;
  }
  if (doubt.status === 'withdrawn') {
    store.remove(DOUBT_KEY);
    showNext(false);
    show('raise');
    return;
  }
  $('my-doubt').textContent = `${CATEGORY_NAMES[doubt.category] ?? doubt.category}: ${doubt.description}`;
  const ahead = doubt.position - 1;
  $('position').textContent = String(doubt.position);
  $('status-line').textContent =
    ahead === 0
      ? 'Nobody is ahead of you. This updates every 3 seconds.'
      : `${ahead} ${ahead === 1 ? 'person is' : 'people are'} ahead of you. This updates every 3 seconds.`;
  const helping = doubt.status === 'helping';
  $('position').hidden = helping;
  $('token-label').textContent = helping ? 'The TA is on the way' : 'Your place in the queue';
  if (helping) {
    $('status-line').textContent = 'Stay at your system.';
  }
  showNext(doubt.status === 'waiting' && doubt.position === 1);
  show('status');
}

// RH-15: a clear alert when you reach the front of the queue.
let wasNext = false;

function showNext(isNext) {
  $('next-banner').hidden = !isNext;
  document.title = isNext ? `You're next – ${TITLE}` : TITLE;
  if (isNext && !wasNext && 'vibrate' in navigator) {
    navigator.vibrate(200);
  }
  wasNext = isNext;
}

// RH-01: join with name and system number.
$('join-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = $('name').value.trim();
  const systemNo = $('system').value.trim();
  const code = $('code').value.trim().toUpperCase();
  const missing = [];
  if (!name) {
    missing.push('your name');
  }
  if (!systemNo) {
    missing.push('your system number');
  }
  if (!code) {
    missing.push('the session code');
  }
  if (missing.length > 0) {
    $('join-error').textContent = `Enter ${listOf(missing)}.`;
    return;
  }
  const student = { name, systemNo };
  const check = await request(`/api/sessions/${encodeURIComponent(code)}`);
  if (!check.ok) {
    $('join-error').textContent =
      check.status === 404 ? 'No open session has that code. Check it with your TA.' : check.data.error;
    return;
  }
  student.code = code;
  $('join-error').textContent = '';
  store.set(STUDENT_KEY, student);
  await refresh();
});

$('leave').addEventListener('click', () => {
  store.remove(STUDENT_KEY);
  store.remove(DOUBT_KEY);
  refresh();
});

// RH-02: raise a doubt.
$('description').addEventListener('input', () => {
  $('count').textContent = String($('description').value.length);
});

$('raise-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const student = store.get(STUDENT_KEY);
  const category = document.querySelector('input[name="category"]:checked')?.value;
  const description = $('description').value.trim();
  if (!category || !description) {
    $('raise-error').textContent = category ? 'Describe your doubt in one line.' : 'Pick what your doubt is about.';
    return;
  }
  const body = { studentName: student.name, systemNo: student.systemNo, category, description };
  body.sessionCode = student.code;
  const res = await request('/api/doubts', { method: 'POST', body });
  if (res.status === 404) {
    // The session ended: keep the name and system number, ask for the new code.
    store.remove(STUDENT_KEY);
    $('name').value = student.name;
    $('system').value = student.systemNo;
    $('join-error').textContent = 'That session has ended. Enter the new code from your TA.';
    show('join');
    return;
  }
  if (!res.ok) {
    $('raise-error').textContent = res.data.error ?? 'Something went wrong. Try again.';
    return;
  }
  store.set(DOUBT_KEY, { id: res.data.id, token: res.data.token });
  $('raise-form').reset();
  $('count').textContent = '0';
  $('raise-error').textContent = '';
  renderDoubt(res.data);
});

$('again').addEventListener('click', () => {
  show('raise');
});

// RH-08: withdraw a doubt you fixed yourself.
$('withdraw').addEventListener('click', async () => {
  const saved = store.get(DOUBT_KEY);
  if (!saved || !window.confirm('Withdraw your doubt? You will lose your place in the queue.')) {
    return;
  }
  const res = await request(`/api/doubts/${saved.id}/withdraw`, {
    method: 'POST',
    headers: { 'X-Doubt-Token': saved.token },
  });
  if (!res.ok && res.status !== 409) {
    $('status-line').textContent = res.data.error ?? 'Could not withdraw. Try again.';
    return;
  }
  store.remove(DOUBT_KEY);
  await refresh();
});

refresh();

// RH-06: keep the position fresh without reloading.
setInterval(() => {
  if (document.visibilityState === 'visible' && store.get(DOUBT_KEY)) {
    refresh();
  }
}, POLL_MS);
