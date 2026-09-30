const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/auth');
const { getAll, getOne, insert, update, remove, count } = require('../database/db');

// Gallery folder
const galleryDir = path.join(__dirname, '../public/images/gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Login ───────────────────────────────────────────────────
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/login.html')));
router.get('/', (req, res) => res.redirect('/admin/login'));

// ── Auth required below ─────────────────────────────────────
router.use(authenticateAdmin);

// ── Dashboard ───────────────────────────────────────────────
router.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/dashboard.html')));

router.get('/api/stats', (req, res) => {
  res.json({
    announcements: count('announcements'),
    inquiries: count('inquiries'),
    unread: count('inquiries', i => !i.is_read),
    gallery: count('gallery'),
    staff: count('staff')
  });
});

// ── Announcements ───────────────────────────────────────────
router.get('/announcements', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/announcements.html')));

router.get('/api/announcements', (req, res) => {
  res.json({ success: true, data: getAll('announcements') });
});

router.post('/api/announcements', (req, res) => {
  const { title_en, title_kn, title_hi, content_en, content_kn, content_hi, category } = req.body;
  insert('announcements', { title_en, title_kn: title_kn||'', title_hi: title_hi||'', content_en, content_kn: content_kn||'', content_hi: content_hi||'', category: category||'news', is_active: 1 });
  res.json({ success: true, message: 'Announcement added successfully!' });
});

router.put('/api/announcements/:id', (req, res) => {
  update('announcements', req.params.id, req.body);
  res.json({ success: true, message: 'Updated successfully!' });
});

router.delete('/api/announcements/:id', (req, res) => {
  remove('announcements', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Gallery ─────────────────────────────────────────────────
router.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/gallery.html')));

router.get('/api/gallery', (req, res) => res.json({ success: true, data: getAll('gallery') }));

router.post('/api/gallery', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  insert('gallery', { title: req.body.title || 'School Photo', filename: req.file.filename, category: req.body.category || 'general' });
  res.json({ success: true, message: 'Photo uploaded successfully!' });
});

router.delete('/api/gallery/:id', (req, res) => {
  const item = getOne('gallery', g => g.id === parseInt(req.params.id));
  if (item) {
    const fp = path.join(galleryDir, item.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  remove('gallery', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Staff ───────────────────────────────────────────────────
router.get('/staff', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/staff.html')));

router.get('/api/staff', (req, res) => res.json({ success: true, data: getAll('staff') }));

router.post('/api/staff', (req, res) => {
  const { name, designation, subject, qualification } = req.body;
  insert('staff', { name, designation, subject: subject||'', qualification: qualification||'', is_active: 1 });
  res.json({ success: true, message: 'Staff member added!' });
});

router.delete('/api/staff/:id', (req, res) => {
  remove('staff', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Inquiries ───────────────────────────────────────────────
router.get('/inquiries', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/inquiries.html')));

router.get('/api/inquiries', (req, res) => res.json({ success: true, data: getAll('inquiries') }));

router.put('/api/inquiries/:id/read', (req, res) => {
  update('inquiries', req.params.id, { is_read: 1 });
  res.json({ success: true });
});

router.delete('/api/inquiries/:id', (req, res) => {
  remove('inquiries', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Change Password ─────────────────────────────────────────
router.post('/api/change-password', (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = getOne('admins', a => a.id === req.admin.id);
  if (!bcrypt.compareSync(current_password, admin.password)) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  update('admins', req.admin.id, { password: bcrypt.hashSync(new_password, 10) });
  res.json({ success: true, message: 'Password changed successfully!' });
});

module.exports = router;
