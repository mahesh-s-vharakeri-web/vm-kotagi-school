const express = require('express');
const router = express.Router();
const { getDb, all, get, run, saveDb } = require('../database/db');

// GET /api/announcements
router.get('/announcements', async (req, res) => {
  try {
    const db = await getDb();
    const announcements = all(db, 'SELECT * FROM announcements WHERE is_active = 1 ORDER BY id DESC LIMIT 10');
    res.json({ success: true, data: announcements });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/gallery
router.get('/gallery', async (req, res) => {
  try {
    const db = await getDb();
    const gallery = all(db, 'SELECT * FROM gallery ORDER BY id DESC');
    res.json({ success: true, data: gallery });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/staff
router.get('/staff', async (req, res) => {
  try {
    const db = await getDb();
    const staff = all(db, 'SELECT * FROM staff WHERE is_active = 1 ORDER BY id ASC');
    res.json({ success: true, data: staff });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/inquiry
router.post('/inquiry', async (req, res) => {
  const { parent_name, student_name, phone, email, class_applying, message } = req.body;
  if (!parent_name || !student_name || !phone || !class_applying) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }
  try {
    const db = await getDb();
    run(db, `INSERT INTO inquiries (parent_name, student_name, phone, email, class_applying, message) VALUES (?, ?, ?, ?, ?, ?)`,
      [parent_name, student_name, phone, email || '', class_applying, message || '']);
    res.json({ success: true, message: 'Your inquiry has been submitted! We will contact you soon.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error. Please call us directly.' });
  }
});

module.exports = router;
