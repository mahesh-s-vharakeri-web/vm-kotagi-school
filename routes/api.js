const express = require('express');
const router  = express.Router();
const { getAll, getOne, insert } = require('../database/db');
const { sendInquiryEmail }       = require('../services/email');

// GET /api/announcements
router.get('/announcements', async (req, res) => {
  try {
    const all = await getAll('announcements');
    const announcements = all.filter(a => a.is_active === 1).slice(0, 10);
    res.json({ success: true, data: announcements });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error loading announcements' });
  }
});

// GET /api/gallery
router.get('/gallery', async (req, res) => {
  try {
    res.json({ success: true, data: await getAll('gallery') });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error loading gallery' });
  }
});

// GET /api/staff
router.get('/staff', async (req, res) => {
  try {
    const staff = (await getAll('staff')).filter(s => s.is_active === 1);
    res.json({ success: true, data: staff });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error loading staff' });
  }
});

// POST /api/inquiry
router.post('/inquiry', async (req, res) => {
  try {
    const { parent_name, student_name, phone, email, class_applying, message } = req.body;
    if (!parent_name || !student_name || !phone || !class_applying) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const inquiry = await insert('inquiries', {
      parent_name, student_name, phone,
      email: email || '', class_applying,
      message: message || '', is_read: 0
    });

    sendInquiryEmail(inquiry).catch(err => console.error('Email error:', err));
    res.json({ success: true, message: 'Your inquiry has been submitted! We will contact you soon.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Something went wrong. Please call us directly.' });
  }
});

module.exports = router;
