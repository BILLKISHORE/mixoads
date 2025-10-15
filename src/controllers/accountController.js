const tokenManager = require('../utils/tokenManager');
const logger = require('../utils/logger');

async function connectAccount(req, res) {
  try {
    const { platform, account_id } = req.validatedBody;

    logger.info('Connecting account', { platform, account_id });

    await new Promise(resolve => setTimeout(resolve, 100));

    const tokens = tokenManager.generateTokens(platform, account_id);

    res.status(200).json({
      status: 'connected',
      ...tokens
    });
  } catch (error) {
    logger.error('Failed to connect account', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect account'
    });
  }
}

async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token required'
      });
    }

    const newTokens = tokenManager.refreshAccessToken(refresh_token);

    res.status(200).json({
      status: 'success',
      ...newTokens
    });
  } catch (error) {
    logger.error('Failed to refresh token', { error: error.message });
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
}

module.exports = {
  connectAccount,
  refreshToken
};


