const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/auth');
const { getDb, all, get, run, saveDb } = require('../database/db');

// Ensure gallery folder exists
const galleryDir = path.join(__dirname, '../public/images/gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

// Multer storage for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Login Page ─────────────────────────────────────────────
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/login.html'));
});
router.get('/', (req, res) => res.redirect('/admin/login'));

// ── All routes below require authentication ─────────────────
router.use(authenticateAdmin);

// ── Dashboard ───────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
});

router.get('/api/stats', async (req, res) => {
  try {
    const db = await getDb();
    const announcements = get(db, 'SELECT COUNT(*) as c FROM announcements').c;
    const inquiries = get(db, 'SELECT COUNT(*) as c FROM inquiries').c;
    const unread = get(db, 'SELECT COUNT(*) as c FROM inquiries WHERE is_read = 0').c;
    const gallery = get(db, 'SELECT COUNT(*) as c FROM gallery').c;
    const staff = get(db, 'SELECT COUNT(*) as c FROM staff').c;
    res.json({ announcements, inquiries, unread, gallery, staff });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── Announcements ───────────────────────────────────────────
router.get('/announcements', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/announcements.html'));
});

router.get('/api/announcements', async (req, res) => {
  try {
    const db = await getDb();
    const data = all(db, 'SELECT * FROM announcements ORDER BY id DESC');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/api/announcements', async (req, res) => {
  const { title_en, title_kn, title_hi, content_en, content_kn, content_hi, category } = req.body;
  try {
    const db = await getDb();
    run(db, `INSERT INTO announcements (title_en, title_kn, title_hi, content_en, content_kn, content_hi, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title_en, title_kn || '', title_hi || '', content_en, content_kn || '', content_hi || '', category || 'news']);
    res.json({ success: true, message: 'Announcement added successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/api/announcements/:id', async (req, res) => {
  const { title_en, title_kn, title_hi, content_en, content_kn, content_hi, category, is_active } = req.body;
  try {
    const db = await getDb();
    run(db, `UPDATE announcements SET title_en=?, title_kn=?, title_hi=?, content_en=?, content_kn=?, content_hi=?, category=?, is_active=? WHERE id=?`,
      [title_en || '', title_kn || '', title_hi || '', content_en || '', content_kn || '', content_hi || '', category || 'news', is_active !== undefined ? is_active : 1, req.params.id]);
    res.json({ success: true, message: 'Updated successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/api/announcements/:id', async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ── Gallery ─────────────────────────────────────────────────
router.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/gallery.html'));
});

router.get('/api/gallery', async (req, res) => {
  try {
    const db = await getDb();
    const data = all(db, 'SELECT * FROM gallery ORDER BY id DESC');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/api/gallery', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const db = await getDb();
    run(db, 'INSERT INTO gallery (title, filename, category) VALUES (?, ?, ?)',
      [req.body.title || 'School Photo', req.file.filename, req.body.category || 'general']);
    res.json({ success: true, message: 'Photo uploaded successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/api/gallery/:id', async (req, res) => {
  try {
    const db = await getDb();
    const item = get(db, 'SELECT filename FROM gallery WHERE id = ?', [req.params.id]);
    if (item) {
      const filePath = path.join(galleryDir, item.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    run(db, 'DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ── Staff ───────────────────────────────────────────────────
router.get('/staff', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/staff.html'));
});

router.get('/api/staff', async (req, res) => {
  try {
    const db = await getDb();
    const data = all(db, 'SELECT * FROM staff ORDER BY id ASC');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/api/staff', async (req, res) => {
  const { name, designation, subject, qualification } = req.body;
  try {
    const db = await getDb();
    run(db, 'INSERT INTO staff (name, designation, subject, qualification) VALUES (?, ?, ?, ?)',
      [name, designation, subject || '', qualification || '']);
    res.json({ success: true, message: 'Staff member added!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/api/staff/:id', async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ── Inquiries ───────────────────────────────────────────────
router.get('/inquiries', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/inquiries.html'));
});

router.get('/api/inquiries', async (req, res) => {
  try {
    const db = await getDb();
    const data = all(db, 'SELECT * FROM inquiries ORDER BY id DESC');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/api/inquiries/:id/read', async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'UPDATE inquiries SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ── Change Password ─────────────────────────────────────────
router.post('/api/change-password', async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const db = await getDb();
    const admin = get(db, 'SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!bcrypt.compareSync(current_password, admin.password)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const hashed = bcrypt.hashSync(new_password, 10);
    run(db, 'UPDATE admins SET password = ? WHERE id = ?', [hashed, req.admin.id]);
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
