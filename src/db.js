const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'raisehand.db');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    code       TEXT    NOT NULL UNIQUE,
    status     TEXT    NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'closed')),
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    closed_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS doubts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   INTEGER REFERENCES sessions (id),
    student_name TEXT    NOT NULL,
    system_no    TEXT    NOT NULL,
    category     TEXT    NOT NULL,
    description  TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'waiting'
                 CHECK (status IN ('waiting', 'helping', 'resolved', 'withdrawn')),
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    helping_at   TEXT,
    resolved_at  TEXT
  );

  CREATE INDEX IF NOT EXISTS doubts_queue_idx ON doubts (session_id, status, id);
`;

/**
 * Adds a column to an existing table when it is missing, so a database file
 * created by an earlier version keeps working. Table and column names are
 * constants from this file, never user input.
 */
function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((existing) => existing.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/**
 * Opens (or creates) the SQLite database and makes sure the tables exist.
 * Uses Node's built-in SQLite module, so there is nothing extra to install.
 * Pass ':memory:' in tests for a throwaway database.
 */
function openDatabase(file = process.env.DB_PATH || DEFAULT_DB_PATH) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  ensureColumn(db, 'doubts', 'token', 'TEXT');
  return db;
}

module.exports = { openDatabase };
