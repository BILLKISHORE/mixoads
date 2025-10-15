const tokenManager = require('../utils/tokenManager');

describe('TokenManager', () => {
  beforeEach(() => {
    tokenManager.tokens.clear();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const result = tokenManager.generateTokens('meta', 'account_123');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('expires_in', 120);
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.refresh_token).toBe('string');
    });

    it('should store token data correctly', () => {
      const result = tokenManager.generateTokens('google', 'account_456');
      const tokenData = tokenManager.getTokenData(result.access_token);

      expect(tokenData).toBeDefined();
      expect(tokenData.platform).toBe('google');
      expect(tokenData.accountId).toBe('account_456');
      expect(tokenData.accessToken).toBe(result.access_token);
      expect(tokenData.refreshToken).toBe(result.refresh_token);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const { access_token } = tokenManager.generateTokens('meta', 'account_123');
      const validation = tokenManager.validateToken(access_token);

      expect(validation.valid).toBe(true);
      expect(validation.expired).toBe(false);
      expect(validation.tokenData).toBeDefined();
    });

    it('should reject an invalid token', () => {
      const validation = tokenManager.validateToken('invalid_token_xyz');

      expect(validation.valid).toBe(false);
      expect(validation.expired).toBe(false);
    });

    it('should detect expired token', async () => {
      const { access_token } = tokenManager.generateTokens('meta', 'account_123');
      const tokenData = tokenManager.getTokenData(access_token);
      tokenData.expiresAt = Date.now() - 1000;

      const validation = tokenManager.validateToken(access_token);

      expect(validation.valid).toBe(false);
      expect(validation.expired).toBe(true);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', () => {
      const original = tokenManager.generateTokens('tiktok', 'account_789');
      const refreshed = tokenManager.refreshAccessToken(original.refresh_token);

      expect(refreshed).toHaveProperty('access_token');
      expect(refreshed).toHaveProperty('refresh_token');
      expect(refreshed.access_token).not.toBe(original.access_token);
      
      const oldValidation = tokenManager.validateToken(original.access_token);
      expect(oldValidation.valid).toBe(false);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        tokenManager.refreshAccessToken('invalid_refresh_token');
      }).toThrow('Invalid refresh token');
    });

    it('should maintain platform and account after refresh', () => {
      const original = tokenManager.generateTokens('meta', 'account_999');
      const refreshed = tokenManager.refreshAccessToken(original.refresh_token);
      const tokenData = tokenManager.getTokenData(refreshed.access_token);

      expect(tokenData.platform).toBe('meta');
      expect(tokenData.accountId).toBe('account_999');
    });
  });
});


