const crypto = require('crypto');

const tokens = new Map(); // token -> { adminId, adminUsername }

function generateToken(adminId, adminUsername) {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { adminId, adminUsername });
  return token;
}

function deleteToken(token) {
  tokens.delete(token);
}

function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  const data = tokens.get(token);
  if (!data) return res.status(401).json({ error: 'Unauthorized' });
  req.adminId = data.adminId;
  req.adminUsername = data.adminUsername;
  next();
}

module.exports = { requireAdmin, generateToken, deleteToken };
