const logger = require('./logger');

async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable = 
        retryableErrors.includes(error.code) ||
        (error.response && error.response.status >= 500) ||
        error.message.includes('rate limit');

      if (!isRetryable || attempt === maxRetries) {
        logger.error('Operation failed after retries', {
          attempt: attempt + 1,
          error: error.message,
          code: error.code
        });
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      logger.warn('Retrying operation', {
        attempt: attempt + 1,
        maxRetries,
        delayMs: Math.round(totalDelay),
        error: error.message
      });

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

module.exports = { withRetry };


