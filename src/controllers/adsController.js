const adPlatformService = require('../services/adPlatformService');
const idempotencyStore = require('../utils/idempotency');
const logger = require('../utils/logger');

async function batchCreateAds(req, res) {
  try {
    const { platform, account_id, campaign_id, ads, batch_id } = req.validatedBody;

    const cachedResponse = idempotencyStore.get(batch_id);
    if (cachedResponse) {
      logger.info('Returning cached batch ads response', { batch_id });
      return res.status(200).json(cachedResponse);
    }

    const createdAds = await adPlatformService.batchCreateAds(
      platform,
      account_id,
      campaign_id,
      ads,
      batch_id
    );

    const response = {
      status: 'success',
      ads: createdAds
    };

    idempotencyStore.set(batch_id, response);

    res.status(201).json(response);
  } catch (error) {
    logger.error('Failed to batch create ads', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to batch create ads',
      details: error.message
    });
  }
}

module.exports = {
  batchCreateAds
};


