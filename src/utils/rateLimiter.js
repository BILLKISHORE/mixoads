const rateLimit = require('express-rate-limit');
const logger = require('./logger');

const createPlatformLimiter = (platform) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: platform === 'meta' ? 20 : platform === 'google' ? 15 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { 
        platform, 
        ip: req.ip,
        path: req.path 
      });
      res.status(429).json({
        status: 'error',
        message: `Rate limit exceeded for ${platform}. Please try again later.`
      });
    },
    skip: (req) => {
      return process.env.NODE_ENV === 'test';
    }
  });
};

const platformLimiters = {
  meta: createPlatformLimiter('meta'),
  google: createPlatformLimiter('google'),
  tiktok: createPlatformLimiter('tiktok')
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { platformLimiters, generalLimiter };


