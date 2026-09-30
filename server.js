require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// Serve main website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize DB then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     V.M. Kotagi Basava Samskruti School Website        ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Public Website  →  http://localhost:${PORT}           ║`);
    console.log(`║  🔐 Admin Panel     →  http://localhost:${PORT}/admin      ║`);
    console.log('║  👤 Admin Login     →  admin / admin@school123         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
