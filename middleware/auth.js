const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const token = req.cookies.adminToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    // If API request, return 401
    if (req.path.startsWith('/api') || req.xhr) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Otherwise redirect to login
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    if (req.path.startsWith('/api') || req.xhr) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.redirect('/admin/login');
  }
}

module.exports = { authenticateAdmin };
