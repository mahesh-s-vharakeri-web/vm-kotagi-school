/**
 * MongoDB Database Layer — Vercel Serverless Compatible
 * Uses mongoose connection state to handle cold starts correctly.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Admin, Announcement, Gallery, Staff, Inquiry } = require('./models');

// ── Serverless-safe connection ────────────────────────
// mongoose.connection.readyState: 0=disconnected 1=connected 2=connecting 3=disconnecting
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return; // already connected/connecting

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables!');
    throw new Error('MONGODB_URI environment variable is not set!');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS:          45000,
    maxPoolSize:              10,
    bufferCommands:           false,   // fail fast instead of buffering on disconnect
  });
  console.log('✅ Connected to MongoDB Atlas');
}

// ── Map collection names → Mongoose models ────────────
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

// ── Generic async helpers ─────────────────────────────

async function getAll(table) {
  await connectDB();
  const docs = await getModel(table).find({}).sort({ createdAt: -1 }).lean();
  return docs.map(normalise);
}

async function getOne(table, predicate) {
  await connectDB();
  if (typeof predicate === 'function') {
    const all = await getAll(table);
    return all.find(predicate) || null;
  }
  const doc = await getModel(table).findOne(predicate).lean();
  return doc ? normalise(doc) : null;
}

async function insert(table, data) {
  await connectDB();
  const doc = await getModel(table).create(data);
  return normalise(doc.toObject());
}

async function update(table, id, data) {
  await connectDB();
  await getModel(table).findByIdAndUpdate(id, { $set: data });
}

async function remove(table, id) {
  await connectDB();
  await getModel(table).findByIdAndDelete(id);
}

async function count(table, predicate) {
  await connectDB();
  if (!predicate) return getModel(table).countDocuments();
  const all = await getAll(table);
  return all.filter(predicate).length;
}

// ── Normalise MongoDB docs to match old in-memory shape ──
function normalise(doc) {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return {
    id:         _id.toString(),
    created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
    ...rest,
  };
}

// ── Seed each collection independently if empty ───────
async function seedIfEmpty() {
  console.log('🔍 Checking collections for seed data…');

  // Admin
  if (await Admin.countDocuments() === 0) {
    const pwd = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@school123';
    await Admin.create({ username: 'admin', password: bcrypt.hashSync(pwd, 10), name: 'School Administrator' });
    console.log('✅ Admin seeded');
  }

  // Announcements
  if (await Announcement.countDocuments() === 0) {
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
      },
    ]);
    console.log('✅ Announcements seeded');
  }

  // Staff
  if (await Staff.countDocuments() === 0) {
    await Staff.insertMany([
      { name: 'Mrs. Rekha Patil', designation: 'Principal',      subject: 'Administration', qualification: 'M.Ed',       is_active: 1 },
      { name: 'Mr. Suresh Kumar', designation: 'Senior Teacher', subject: 'Mathematics',    qualification: 'B.Ed, M.Sc', is_active: 1 },
      { name: 'Mrs. Anitha Nair', designation: 'Class Teacher',  subject: 'English & EVS',  qualification: 'B.Ed, BA',   is_active: 1 },
    ]);
    console.log('✅ Staff seeded');
  }

  // Gallery
  if (await Gallery.countDocuments() === 0) {
    await Gallery.insertMany([
      { title: 'Computer Lab',      filename: 'classroom.jpg',  category: 'facility' },
      { title: 'Playground',        filename: 'sports.jpg',     category: 'sports'   },
      { title: 'School Library',    filename: 'smartboard.jpg', category: 'facility' },
      { title: 'Yoga & Meditation', filename: 'cultural.jpg',   category: 'cultural' },
    ]);
    console.log('✅ Gallery seeded');
  }

  console.log('✅ Seed check complete');
}

// ── Main init — called once in server.js ──────────────
async function initializeDatabase() {
  await connectDB();
  await seedIfEmpty();
}

function getDb() { return mongoose.connection; }

module.exports = { getDb, getAll, getOne, insert, update, remove, count, initializeDatabase, connectDB };
