// Student page. Owner: Shivansh.
// What the student enters is remembered in this browser (localStorage).

const STUDENT_KEY = 'raisehand.student';

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

/** Picks the view from what this browser remembers, then asks for the doubt's latest state. */
async function refresh() {
  const student = store.get(STUDENT_KEY);
  if (!student) {
    show('join');
    return;
  }
  $('who').textContent = `${student.name}, system ${student.systemNo}`;
  show('raise');
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
  refresh();
});

refresh();
