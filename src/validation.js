const CATEGORIES = ['compile-error', 'logic', 'viva', 'other'];
const LIMITS = { name: 60, systemNo: 20, description: 140 };

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Checks a new doubt. Returns { value } with trimmed fields, or { error }
 * with a message the student can act on.
 */
function validateDoubt(body) {
  const input = body && typeof body === 'object' ? body : {};
  const studentName = text(input.studentName);
  const systemNo = text(input.systemNo);
  const description = text(input.description);
  const { category } = input;

  if (!studentName) {
    return { error: 'Enter your name.' };
  }
  if (studentName.length > LIMITS.name) {
    return { error: `Keep your name to ${LIMITS.name} characters or fewer.` };
  }
  if (!systemNo) {
    return { error: 'Enter your system number.' };
  }
  if (systemNo.length > LIMITS.systemNo) {
    return { error: `Keep the system number to ${LIMITS.systemNo} characters or fewer.` };
  }
  if (!CATEGORIES.includes(category)) {
    return { error: 'Pick a category: compile error, logic, viva prep or other.' };
  }
  if (!description) {
    return { error: 'Describe your doubt in one line.' };
  }
  if (description.length > LIMITS.description) {
    return { error: `Keep the description to ${LIMITS.description} characters or fewer.` };
  }
  return { value: { studentName, systemNo, category, description } };
}

module.exports = { CATEGORIES, LIMITS, validateDoubt };
