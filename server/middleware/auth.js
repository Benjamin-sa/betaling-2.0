// server/middleware/auth.js
const admin = require('../config/firebaseAdmin');

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
  const userId = req.user.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (userDoc.exists && userDoc.data().isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Verboden: Admins only' });
    }
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { authenticate, authorizeAdmin };