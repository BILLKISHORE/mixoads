const adPlatformService = require('../services/adPlatformService');
const logger = require('../utils/logger');

async function fetchAnalytics(req, res) {
  try {
    const { platform, account_id, campaign_id } = req.query;

    if (!platform || !account_id) {
      return res.status(400).json({
        status: 'error',
        message: 'platform and account_id query parameters are required'
      });
    }

    const analytics = await adPlatformService.fetchAnalytics(
      platform,
      account_id,
      campaign_id
    );

    res.status(200).json(analytics);
  } catch (error) {
    logger.error('Failed to fetch analytics', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics',
      details: error.message
    });
  }
}

module.exports = {
  fetchAnalytics
};


