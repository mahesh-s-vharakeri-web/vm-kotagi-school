const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');
const bcrypt  = require('bcryptjs');
const fs      = require('fs');
const { authenticateAdmin }                          = require('../middleware/auth');
const { getAll, getOne, insert, update, remove, count } = require('../database/db');

// Gallery upload folder
const galleryDir = path.join(__dirname, '../public/images/gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Login page (public) ──────────────────────────────
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/admin/login.html')));
router.get('/',      (req, res) => res.redirect('/admin/login'));

// ── All routes below require auth ────────────────────
router.use(authenticateAdmin);

// ── Dashboard ────────────────────────────────────────
router.get('/dashboard', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/admin/dashboard.html')));

router.get('/api/stats', async (req, res) => {
  try {
    const [ann, inq, gallery, staff] = await Promise.all([
      count('announcements'),
      count('inquiries'),
      count('gallery'),
      count('staff'),
    ]);
    const allInq = await getAll('inquiries');
    const unread = allInq.filter(i => !i.is_read).length;
    res.json({ announcements: ann, inquiries: inq, unread, gallery, staff });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Announcements ────────────────────────────────────
router.get('/announcements', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/admin/announcements.html')));

router.get('/api/announcements', async (req, res) => {
  res.json({ success: true, data: await getAll('announcements') });
});

router.post('/api/announcements', async (req, res) => {
  try {
    const { title_en, title_kn, title_hi, content_en, content_kn, content_hi, category } = req.body;
    await insert('announcements', {
      title_en, title_kn: title_kn||'', title_hi: title_hi||'',
      content_en, content_kn: content_kn||'', content_hi: content_hi||'',
      category: category||'news', is_active: 1
    });
    res.json({ success: true, message: 'Announcement added successfully!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/api/announcements/:id', async (req, res) => {
  await update('announcements', req.params.id, req.body);
  res.json({ success: true, message: 'Updated successfully!' });
});

router.delete('/api/announcements/:id', async (req, res) => {
  await remove('announcements', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Gallery ──────────────────────────────────────────
router.get('/gallery', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/admin/gallery.html')));

router.get('/api/gallery', async (req, res) =>
  res.json({ success: true, data: await getAll('gallery') }));

router.post('/api/gallery', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  await insert('gallery', {
    title:    req.body.title || 'School Photo',
    filename: req.file.filename,
    category: req.body.category || 'general'
  });
  res.json({ success: true, message: 'Photo uploaded successfully!' });
});

router.delete('/api/gallery/:id', async (req, res) => {
  const item = await getOne('gallery', { _id: req.params.id });
  if (item) {
    const fp = path.join(galleryDir, item.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  await remove('gallery', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Staff ────────────────────────────────────────────
router.get('/staff', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/admin/staff.html')));

router.get('/api/staff', async (req, res) =>
  res.json({ success: true, data: await getAll('staff') }));

router.post('/api/staff', async (req, res) => {
  const { name, designation, subject, qualification } = req.body;
  await insert('staff', { name, designation, subject: subject||'', qualification: qualification||'', is_active: 1 });
  res.json({ success: true, message: 'Staff member added!' });
});

router.delete('/api/staff/:id', async (req, res) => {
  await remove('staff', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Inquiries ────────────────────────────────────────
router.get('/inquiries', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/admin/inquiries.html')));

router.get('/api/inquiries', async (req, res) =>
  res.json({ success: true, data: await getAll('inquiries') }));

router.put('/api/inquiries/:id/read', async (req, res) => {
  await update('inquiries', req.params.id, { is_read: 1 });
  res.json({ success: true });
});

router.delete('/api/inquiries/:id', async (req, res) => {
  await remove('inquiries', req.params.id);
  res.json({ success: true, message: 'Deleted successfully!' });
});

// ── Change Password ───────────────────────────────────
router.post('/api/change-password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const admin = await getOne('admins', { _id: req.admin.id });
    if (!bcrypt.compareSync(current_password, admin.password)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    await update('admins', req.admin.id, { password: bcrypt.hashSync(new_password, 10) });
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
