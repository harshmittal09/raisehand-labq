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
  $('my-doubt').textContent = `${CATEGORY_NAMES[doubt.category] ?? doubt.category}: ${doubt.description}`;
  show('status');
}

// RH-01: join with name and system number.
$('join-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = $('name').value.trim();
  const systemNo = $('system').value.trim();
  const missing = [];
  if (!name) {
    missing.push('your name');
  }
  if (!systemNo) {
    missing.push('your system number');
  }
  if (missing.length > 0) {
    $('join-error').textContent = `Enter ${listOf(missing)}.`;
    return;
  }
  const student = { name, systemNo };
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
  const res = await request('/api/doubts', { method: 'POST', body });
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

refresh();
