const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolve the DB file relative to this file, not relative to the
// process working directory. This matters on Render where the process
// might be started from a different cwd than you expect.
const DB_PATH = path.join(__dirname, 'reports.db');

const db = new sqlite3.Database(DB_PATH);

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      report TEXT NOT NULL,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;