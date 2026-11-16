require('dotenv').config();
const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');
const { initializeDatabase } = require('./database/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const apiRoutes   = require('./routes/api');
const adminRoutes = require('./routes/admin');
const authRoutes  = require('./routes/auth');

app.use('/api',   apiRoutes);
app.use('/admin', adminRoutes);
app.use('/auth',  authRoutes);

// Serve main website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB then start server
initializeDatabase()
  .then(() => {
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║     V.M. Kotagi Basava Samskruti School Website        ║');
        console.log('╠════════════════════════════════════════════════════════╣');
        console.log(`║  🌐 Public Website  →  http://localhost:${PORT}           ║`);
        console.log(`║  🔐 Admin Panel     →  http://localhost:${PORT}/admin      ║`);
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log('');
      });
    }
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
