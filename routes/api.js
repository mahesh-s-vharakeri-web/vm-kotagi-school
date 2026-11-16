const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { getAll, getOne, insert, connectDB } = require('../database/db');
const { sendInquiryEmail } = require('../services/email');
const { Admin, Announcement, Gallery, Staff } = require('../database/models');

// GET /api/reseed?key=vmkotagi2025  — force reseed all empty collections
router.get('/reseed', async (req, res) => {
  if (req.query.key !== 'vmkotagi2025') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    await connectDB();
    const results = {};

    if (await Admin.countDocuments() === 0) {
      const pwd = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@school123';
      await Admin.create({ username: 'admin', password: bcrypt.hashSync(pwd, 10), name: 'School Administrator' });
      results.admin = 'seeded';
    } else { results.admin = 'already exists'; }

    if (await Announcement.countDocuments() === 0) {
      await Announcement.insertMany([
        { title_en: 'Admissions Open for 2025-26', title_kn: '2025-26ಕ್ಕೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ', title_hi: '2025-26 के लिए प्रवेश प्रारंभ', content_en: 'Admissions are now open for Nursery, LKG, UKG and Standards 1 to 8. Contact us immediately.', content_kn: 'ನರ್ಸರಿ, LKG, UKG ಮತ್ತು 1 ರಿಂದ 8 ನೇ ತರಗತಿಗೆ ಪ್ರವೇಶ ಪ್ರಾರಂಭ.', content_hi: 'नर्सरी, LKG, UKG और कक्षा 1 से 8 के लिए प्रवेश खुले हैं।', category: 'admissions', is_active: 1 },
        { title_en: 'Smart Board Facility for All Classes', title_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ', title_hi: 'सभी कक्षाओं के लिए स्मार्ट बोर्ड सुविधा', content_en: 'Smart Board facility is now available for all classes, making learning more interactive.', content_kn: 'ಎಲ್ಲಾ ತರಗತಿಗಳಲ್ಲಿ ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.', content_hi: 'सभी कक्षाओं में स्मार्ट बोर्ड सुविधा उपलब्ध है।', category: 'news', is_active: 1 },
        { title_en: 'NEP 2020 Curriculum Implemented', title_kn: 'NEP 2020 ಪಠ್ಯಕ್ರಮ ಜಾರಿ', title_hi: 'NEP 2020 पाठ्यक्रम लागू', content_en: 'Our school has fully implemented the NEP 2020 curriculum in English Medium for all classes.', content_kn: 'ಆಂಗ್ಲ ಮಾಧ್ಯಮದಲ್ಲಿ NEP 2020 ಪಠ್ಯಕ್ರಮ ಸಂಪೂರ್ಣವಾಗಿ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ.', content_hi: 'अंग्रेजी माध्यम में NEP 2020 पाठ्यक्रम लागू किया गया है।', category: 'news', is_active: 1 },
      ]);
      results.announcements = 'seeded';
    } else { results.announcements = 'already exists'; }

    if (await Staff.countDocuments() === 0) {
      await Staff.insertMany([
        { name: 'Mrs. Rekha Patil', designation: 'Principal',      subject: 'Administration', qualification: 'M.Ed',       is_active: 1 },
        { name: 'Mr. Suresh Kumar', designation: 'Senior Teacher', subject: 'Mathematics',    qualification: 'B.Ed, M.Sc', is_active: 1 },
        { name: 'Mrs. Anitha Nair', designation: 'Class Teacher',  subject: 'English & EVS',  qualification: 'B.Ed, BA',   is_active: 1 },
      ]);
      results.staff = 'seeded';
    } else { results.staff = 'already exists'; }

    if (await Gallery.countDocuments() === 0) {
      await Gallery.insertMany([
        { title: 'Computer Lab',      filename: 'classroom.jpg',  category: 'facility' },
        { title: 'Playground',        filename: 'sports.jpg',     category: 'sports'   },
        { title: 'School Library',    filename: 'smartboard.jpg', category: 'facility' },
        { title: 'Yoga & Meditation', filename: 'cultural.jpg',   category: 'cultural' },
      ]);
      results.gallery = 'seeded';
    } else { results.gallery = 'already exists'; }

    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

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
