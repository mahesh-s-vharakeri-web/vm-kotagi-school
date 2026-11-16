const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { getOne } = require('../database/db');

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await getOne('admins', { username });
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      process.env.JWT_SECRET || 'vmkotagi_school_secret_2025',
      { expiresIn: '8h' }
    );
    res.cookie('adminToken', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.json({ success: true, redirect: '/admin/dashboard' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

module.exports = router;
