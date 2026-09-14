const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    }
  } catch {
    req.userId = undefined;
  }
  next();
};

module.exports = optionalAuth;
