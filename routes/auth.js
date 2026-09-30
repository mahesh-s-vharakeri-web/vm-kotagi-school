const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, get, run } = require('../database/db');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = await getDb();
    const admin = get(db, 'SELECT * FROM admins WHERE username = ?', [username]);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.cookie('adminToken', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.json({ success: true, redirect: '/admin/dashboard' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

module.exports = router;
