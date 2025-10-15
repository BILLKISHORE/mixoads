const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed', { 
        path: req.path, 
        errors 
      });

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = { validate };


