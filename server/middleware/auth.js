// server/middleware/auth.js
const admin = require('../config/firebaseAdmin');
const userService = require('../services/user.service');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Geen Auth header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const authorizeAdmin = async (req, res, next) => {
  try {
    const user = await userService.getUserByFirebaseId(req.user.uid);
    
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { authenticate, authorizeAdmin };