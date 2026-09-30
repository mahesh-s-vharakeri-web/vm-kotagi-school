const express = require('express');
const router = express.Router();
const { getAll, getOne, insert } = require('../database/db');

// GET /api/announcements
router.get('/announcements', (req, res) => {
  const announcements = getAll('announcements').filter(a => a.is_active === 1).slice(0, 10);
  res.json({ success: true, data: announcements });
});

// GET /api/gallery
router.get('/gallery', (req, res) => {
  res.json({ success: true, data: getAll('gallery') });
});

// GET /api/staff
router.get('/staff', (req, res) => {
  const staff = getAll('staff').filter(s => s.is_active === 1).reverse();
  res.json({ success: true, data: staff });
});

// POST /api/inquiry
router.post('/inquiry', (req, res) => {
  const { parent_name, student_name, phone, email, class_applying, message } = req.body;
  if (!parent_name || !student_name || !phone || !class_applying) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }
  insert('inquiries', { parent_name, student_name, phone, email: email || '', class_applying, message: message || '', is_read: 0 });
  res.json({ success: true, message: 'Your inquiry has been submitted! We will contact you soon.' });
});

module.exports = router;
