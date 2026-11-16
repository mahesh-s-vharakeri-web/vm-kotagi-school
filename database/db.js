/**
 * MongoDB Database Layer
 * Drop-in replacement for the in-memory store.
 * All routes continue to work without any changes.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Admin, Announcement, Gallery, Staff, Inquiry } = require('./models');

// ── Connection ────────────────────────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set!');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  isConnected = true;
  console.log('✅ Connected to MongoDB Atlas');
}

// ── Map collection names to Mongoose models ──────────
const modelMap = {
  admins:        Admin,
  announcements: Announcement,
  gallery:       Gallery,
  staff:         Staff,
  inquiries:     Inquiry,
};

function getModel(table) {
  const model = modelMap[table];
  if (!model) throw new Error(`Unknown table: ${table}`);
  return model;
}

// ── Generic helpers (async) ───────────────────────────

async function getAll(table) {
  const Model = getModel(table);
  const docs = await Model.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(normalise);
}

async function getOne(table, predicate) {
  // predicate can be a function (legacy) or a plain query object
  if (typeof predicate === 'function') {
    const all = await getAll(table);
    return all.find(predicate) || null;
  }
  const Model = getModel(table);
  const doc = await Model.findOne(predicate).lean();
  return doc ? normalise(doc) : null;
}

async function insert(table, data) {
  const Model = getModel(table);
  const doc = await Model.create(data);
  return normalise(doc.toObject());
}

async function update(table, id, data) {
  const Model = getModel(table);
  await Model.findByIdAndUpdate(id, { $set: data });
}

async function remove(table, id) {
  const Model = getModel(table);
  await Model.findByIdAndDelete(id);
}

async function count(table, predicate) {
  const Model = getModel(table);
  if (!predicate) return Model.countDocuments();
  // predicate is a function — load all and filter (acceptable for small collections)
  const all = await getAll(table);
  return all.filter(predicate).length;
}

// ── Normalise MongoDB docs to look like old in-memory rows ──
// Adds `id` (string), `created_at` so existing route/frontend code works
function normalise(doc) {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return {
    id: _id.toString(),
    created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
    ...rest,
  };
}

// ── Seed on first-ever run ────────────────────────────
async function seedIfEmpty() {
  // Only seed if the DB is completely empty
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    console.log('📦 Database already seeded — skipping seed step');
    return;
  }

  console.log('🌱 Seeding initial data into MongoDB…');

  const pwd = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@school123';
  await Admin.create({ username: 'admin', password: bcrypt.hashSync(pwd, 10), name: 'School Administrator' });

  await Announcement.insertMany([
    {
      title_en: 'Admissions Open for 2025-26',
      title_kn: '2025-26ಕ್ಕೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ',
      title_hi: '2025-26 के लिए प्रवेश प्रारंभ',
      content_en: 'Admissions are now open for Nursery, LKG, UKG and Standards 1 to 8. Contact us immediately.',
      content_kn: 'ನರ್ಸರಿ, LKG, UKG ಮತ್ತು 1 ರಿಂದ 8 ನೇ ತರಗತಿಗೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ.',
      content_hi: 'नर्सरी, LKG, UKG और कक्षा 1 से 8 के लिए प्रवेश खुले हैं।',
      category: 'admissions', is_active: 1
    },
    {
      title_en: 'Smart Board Facility for All Classes',
      title_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ',
      title_hi: 'सभी कक्षाओं के लिए स्मार्ट बोर्ड सुविधा',
      content_en: 'Smart Board facility is now available for all classes, making learning more interactive.',
      content_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಲ್ಲಿ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.',
      content_hi: 'सभी कक्षाओं में स्मार्ट बोर्ड सुविधा उपलब्ध है।',
      category: 'news', is_active: 1
    },
    {
      title_en: 'NEP 2020 Curriculum Implemented',
      title_kn: 'NEP 2020 ಪಠ್ಯಕ್ರಮ ಜಾರಿ',
      title_hi: 'NEP 2020 पाठ्यक्रम लागू',
      content_en: 'Our school has fully implemented the NEP 2020 curriculum in English Medium for all classes.',
      content_kn: 'ಆಂಗ್ಲ ಮಾಧ್ಯಮದಲ್ಲಿ NEP 2020 ಪಠ್ಯಕ್ರಮ ಸಂಪೂರ್ಣವಾಗಿ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ.',
      content_hi: 'अंग्रेजी माध्यम में NEP 2020 पाठ्यक्रम लागू किया गया है।',
      category: 'news', is_active: 1
    }
  ]);

  await Staff.insertMany([
    { name: 'Mrs. Rekha Patil',  designation: 'Principal',       subject: 'Administration', qualification: 'M.Ed',      is_active: 1 },
    { name: 'Mr. Suresh Kumar',  designation: 'Senior Teacher',  subject: 'Mathematics',    qualification: 'B.Ed, M.Sc', is_active: 1 },
    { name: 'Mrs. Anitha Nair',  designation: 'Class Teacher',   subject: 'English & EVS',  qualification: 'B.Ed, BA',   is_active: 1 },
  ]);

  await Gallery.insertMany([
    { title: 'Computer Lab',       filename: 'classroom.jpg',  category: 'facility'  },
    { title: 'Playground',         filename: 'sports.jpg',     category: 'sports'    },
    { title: 'School Library',     filename: 'smartboard.jpg', category: 'facility'  },
    { title: 'Yoga & Meditation',  filename: 'cultural.jpg',   category: 'cultural'  },
  ]);

  console.log('✅ Seed data inserted into MongoDB');
}

// ── initializeDatabase — called once on startup ───────
async function initializeDatabase() {
  await connectDB();
  await seedIfEmpty();
}

function getDb() { return mongoose.connection; }

module.exports = { getDb, getAll, getOne, insert, update, remove, count, initializeDatabase, connectDB };
