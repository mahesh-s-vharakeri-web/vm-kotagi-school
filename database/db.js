const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// On Vercel, use /tmp (writable). Locally, use the database/ folder.
const DB_PATH = process.env.VERCEL
  ? '/tmp/school.db'
  : path.join(__dirname, 'school.db');
let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  // Load existing DB file or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a statement (INSERT/UPDATE/DELETE/CREATE)
function run(db, sql, params = []) {
  db.run(sql, params);
  saveDb();
}

// Helper: get one row
function get(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// Helper: get all rows
function all(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function initializeDatabase() {
  const db = await getDb();

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT NOT NULL,
    title_kn TEXT,
    title_hi TEXT,
    content_en TEXT NOT NULL,
    content_kn TEXT,
    content_hi TEXT,
    category TEXT DEFAULT 'news',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    subject TEXT,
    qualification TEXT,
    photo TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_name TEXT NOT NULL,
    student_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    class_applying TEXT NOT NULL,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  saveDb();

  // Seed default admin
  const adminExists = get(db, 'SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin@school123', 10);
    db.run('INSERT INTO admins (username, password, name) VALUES (?, ?, ?)', ['admin', hashedPassword, 'School Administrator']);
    saveDb();
    console.log('✅ Default admin created: username=admin, password=admin@school123');
  }

  // Seed announcements
  const annRow = get(db, 'SELECT COUNT(*) as c FROM announcements');
  if (!annRow || annRow.c === 0) {
    db.run(`INSERT INTO announcements (title_en, title_kn, title_hi, content_en, content_kn, content_hi, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Admissions Open for 2025-26', '2025-26ಕ್ಕೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ', '2025-26 के लिए प्रवेश प्रारंभ',
       'Admissions are now open for Nursery, LKG, UKG and Standards 1 to 8. Contact us immediately. No donation policy.',
       'ನರ್ಸರಿ, LKG, UKG ಮತ್ತು 1 ರಿಂದ 8 ನೇ ತರಗತಿಗೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ.',
       'नर्सरी, LKG, UKG और कक्षा 1 से 8 के लिए प्रवेश खुले हैं।', 'admissions']);
    db.run(`INSERT INTO announcements (title_en, title_kn, title_hi, content_en, content_kn, content_hi, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Smart Board for All Classes', 'ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್', 'सभी कक्षाओं में स्मार्ट बोर्ड',
       'Smart Board facility is now available for all classes, enhancing the learning experience.',
       'ಎಲ್ಲಾ ತರಗತಿಗಳಲ್ಲಿ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ ಲಭ್ಯ.',
       'सभी कक्षाओं में स्मार्ट बोर्ड सुविधा उपलब्ध है।', 'news']);
    saveDb();
  }

  console.log('✅ Database initialized at:', DB_PATH);
  return db;
}

module.exports = { getDb, initializeDatabase, run, get, all, saveDb };
