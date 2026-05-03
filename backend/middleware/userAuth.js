const crypto = require('crypto');

const userTokens = new Map(); // token -> userId

function generateUserToken() {
  return crypto.randomBytes(32).toString('hex');
}

function storeUserToken(token, userId) {
  userTokens.set(token, userId);
}

function deleteUserToken(token) {
  userTokens.delete(token);
}

function getUserIdFromToken(token) {
  return userTokens.get(token) || null;
}

// Blocks request if not logged in
function requireUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bu işlem için giriş yapmanız gerekiyor' });
  }
  const token = auth.slice(7);
  const userId = userTokens.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
  }
  req.userId    = userId;
  req.userToken = token;
  next();
}

// Sets req.userId if logged in, but never blocks
function optionalUser(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const userId = userTokens.get(token);
    if (userId) {
      req.userId    = userId;
      req.userToken = token;
    }
  }
  next();
}

module.exports = { generateUserToken, storeUserToken, deleteUserToken, getUserIdFromToken, requireUser, optionalUser };
