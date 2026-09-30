/**
 * Simple in-memory database for Vercel serverless deployment.
 * Data is pre-seeded on startup. For local dev, data persists
 * while the server is running.
 */
const bcrypt = require('bcryptjs');

// ── In-memory data store ──────────────────────────────────
const store = {
  admins: [],
  announcements: [],
  gallery: [],
  staff: [],
  inquiries: [],
  _nextId: { admins: 1, announcements: 1, gallery: 1, staff: 1, inquiries: 1 }
};

function nextId(table) {
  return store._nextId[table]++;
}

// ── Generic helpers ──────────────────────────────────────
function getDb() { return store; }

function getAll(table) {
  return [...store[table]].reverse(); // newest first
}

function getOne(table, predicate) {
  return store[table].find(predicate) || null;
}

function insert(table, data) {
  const row = { id: nextId(table), created_at: new Date().toISOString(), ...data };
  store[table].push(row);
  return row;
}

function update(table, id, data) {
  const idx = store[table].findIndex(r => r.id === parseInt(id));
  if (idx !== -1) store[table][idx] = { ...store[table][idx], ...data };
}

function remove(table, id) {
  store[table] = store[table].filter(r => r.id !== parseInt(id));
}

function count(table, predicate) {
  return predicate ? store[table].filter(predicate).length : store[table].length;
}

// ── Seed data ────────────────────────────────────────────
function initializeDatabase() {
  // Default admin
  const hashedPassword = bcrypt.hashSync('admin@school123', 10);
  insert('admins', { username: 'admin', password: hashedPassword, name: 'School Administrator' });

  // Sample announcements
  insert('announcements', {
    title_en: 'Admissions Open for 2025-26',
    title_kn: '2025-26ಕ್ಕೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ',
    title_hi: '2025-26 के लिए प्रवेश प्रारंभ',
    content_en: 'Admissions are now open for Nursery, LKG, UKG and Standards 1 to 8. Contact us immediately. No donation policy.',
    content_kn: 'ನರ್ಸರಿ, LKG, UKG ಮತ್ತು 1 ರಿಂದ 8 ನೇ ತರಗತಿಗೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ. ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ.',
    content_hi: 'नर्सरी, LKG, UKG और कक्षा 1 से 8 के लिए प्रवेश खुले हैं। तुरंत संपर्क करें।',
    category: 'admissions',
    is_active: 1
  });

  insert('announcements', {
    title_en: 'Smart Board Facility for All Classes',
    title_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ',
    title_hi: 'सभी कक्षाओं के लिए स्मार्ट बोर्ड सुविधा',
    content_en: 'Smart Board facility is now available for all classes, making learning more interactive and engaging.',
    content_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಲ್ಲಿ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.',
    content_hi: 'सभी कक्षाओं में स्मार्ट बोर्ड सुविधा उपलब्ध है।',
    category: 'news',
    is_active: 1
  });

  insert('announcements', {
    title_en: 'NEP 2020 Curriculum Implemented',
    title_kn: 'NEP 2020 ಪಠ್ಯಕ್ರಮ ಜಾರಿ',
    title_hi: 'NEP 2020 पाठ्यक्रम लागू',
    content_en: 'Our school has fully implemented the National Education Policy 2020 curriculum in English Medium for all classes.',
    content_kn: 'ನಮ್ಮ ಶಾಲೆ ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಆಂಗ್ಲ ಮಾಧ್ಯಮದಲ್ಲಿ NEP 2020 ಪಠ್ಯಕ್ರಮ ಸಂಪೂರ್ಣವಾಗಿ ಜಾರಿಗೊಳಿಸಿದೆ.',
    content_hi: 'हमारे विद्यालय ने सभी कक्षाओं के लिए अंग्रेजी माध्यम में NEP 2020 पाठ्यक्रम लागू किया है।',
    category: 'news',
    is_active: 1
  });

  // Sample staff
  insert('staff', { name: 'Mrs. Rekha Patil', designation: 'Principal', subject: 'Administration', qualification: 'M.Ed', is_active: 1 });
  insert('staff', { name: 'Mr. Suresh Kumar', designation: 'Senior Teacher', subject: 'Mathematics', qualification: 'B.Ed, M.Sc', is_active: 1 });
  insert('staff', { name: 'Mrs. Anitha Nair', designation: 'Class Teacher', subject: 'English & EVS', qualification: 'B.Ed, BA', is_active: 1 });

  console.log('✅ In-memory database initialized with seed data');
  return Promise.resolve(store);
}

module.exports = { getDb, getAll, getOne, insert, update, remove, count, initializeDatabase };
