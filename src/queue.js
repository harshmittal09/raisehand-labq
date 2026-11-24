/**
 * Queries shared by the student and TA routes. Every query uses prepared
 * statements. `session_id IS ?` matches rows whose session is NULL as well,
 * so the same queries work with and without lab sessions.
 */

const OPEN = "status IN ('waiting', 'helping')";
const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

/** The shape the API returns for a doubt. Tokens never leave the server. */
function toDoubt(row) {
  return {
    id: row.id,
    studentName: row.student_name,
    systemNo: row.system_no,
    category: row.category,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    helpingAt: row.helping_at,
    resolvedAt: row.resolved_at,
  };
}

function findDoubtRow(db, id) {
  if (id === null) {
    return null;
  }
  return db.prepare('SELECT * FROM doubts WHERE id = ?').get(id) ?? null;
}

function isOpen(row) {
  return row.status === 'waiting' || row.status === 'helping';
}

module.exports = {
  NOW,
  OPEN,
  toDoubt,
  findDoubtRow,
  isOpen,
};
