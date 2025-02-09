const jwt = require('jsonwebtoken');
const yogaworkoutAdmin = require('../models/adminuser');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    
    const adminuser = await yogaworkoutAdmin.findById(decodedToken.userId);
    if (!adminuser) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = adminuser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate };