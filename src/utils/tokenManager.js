const crypto = require('crypto');
const logger = require('./logger');

class TokenManager {
  constructor() {
    this.tokens = new Map();
  }

  generateTokens(platform, accountId) {
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 120000; // 120 seconds from now

    const tokenData = {
      accessToken,
      refreshToken,
      expiresAt,
      platform,
      accountId,
      createdAt: new Date().toISOString()
    };

    this.tokens.set(accessToken, tokenData);
    
    logger.info('Generated tokens', { 
      platform, 
      accountId, 
      expiresIn: 120 
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 120
    };
  }

  validateToken(accessToken) {
    const tokenData = this.tokens.get(accessToken);
    
    if (!tokenData) {
      logger.warn('Token not found', { accessToken: accessToken.substring(0, 8) + '...' });
      return { valid: false, expired: false };
    }

    if (Date.now() > tokenData.expiresAt) {
      logger.warn('Token expired', { 
        accessToken: accessToken.substring(0, 8) + '...',
        expiredAt: new Date(tokenData.expiresAt).toISOString()
      });
      return { valid: false, expired: true, tokenData };
    }

    return { valid: true, expired: false, tokenData };
  }

  refreshAccessToken(refreshToken) {
    let foundToken = null;
    
    for (const [accessToken, tokenData] of this.tokens.entries()) {
      if (tokenData.refreshToken === refreshToken) {
        foundToken = { accessToken, tokenData };
        break;
      }
    }

    if (!foundToken) {
      logger.error('Refresh token not found');
      throw new Error('Invalid refresh token');
    }

    this.tokens.delete(foundToken.accessToken);
    
    const newTokens = this.generateTokens(
      foundToken.tokenData.platform, 
      foundToken.tokenData.accountId
    );

    logger.info('Refreshed access token', { 
      platform: foundToken.tokenData.platform,
      accountId: foundToken.tokenData.accountId
    });

    return newTokens;
  }

  getTokenData(accessToken) {
    return this.tokens.get(accessToken);
  }
}

module.exports = new TokenManager();


