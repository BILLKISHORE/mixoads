const logger = require('./logger');

class IdempotencyStore {
  constructor() {
    this.store = new Map();
    this.ttl = 24 * 60 * 60 * 1000; // 24 hours
  }

  set(key, response) {
    const entry = {
      response,
      timestamp: Date.now()
    };
    this.store.set(key, entry);
    
    logger.debug('Idempotency key stored', { key });
    
    setTimeout(() => {
      this.store.delete(key);
    }, this.ttl);
  }

  get(key) {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    logger.info('Idempotency key hit', { key });
    return entry.response;
  }

  has(key) {
    return this.get(key) !== null;
  }
}

module.exports = new IdempotencyStore();


