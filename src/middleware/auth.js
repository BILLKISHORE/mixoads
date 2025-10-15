const tokenManager = require('../utils/tokenManager');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('No token provided', { path: req.path });
    return res.status(401).json({
      status: 'error',
      message: 'Access token required'
    });
  }

  const validation = tokenManager.validateToken(token);

  if (!validation.valid) {
    if (validation.expired) {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  req.tokenData = validation.tokenData;
  next();
};

module.exports = { authenticateToken };


