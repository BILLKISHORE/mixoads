const adPlatformService = require('../services/adPlatformService');
const idempotencyStore = require('../utils/idempotency');
const logger = require('../utils/logger');

async function createCampaign(req, res) {
  try {
    const { platform, account_id, campaign_name, objective, budget, idempotency_key } = req.validatedBody;

    if (idempotency_key) {
      const cachedResponse = idempotencyStore.get(idempotency_key);
      if (cachedResponse) {
        logger.info('Returning cached campaign response', { idempotency_key });
        return res.status(200).json(cachedResponse);
      }
    }

    const result = await adPlatformService.createCampaign(
      platform,
      account_id,
      campaign_name,
      objective,
      budget
    );

    const response = {
      status: 'success',
      campaign_id: result.campaign_id,
      created_at: result.created_at
    };

    if (idempotency_key) {
      idempotencyStore.set(idempotency_key, response);
    }

    res.status(201).json(response);
  } catch (error) {
    logger.error('Failed to create campaign', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to create campaign',
      details: error.message
    });
  }
}

module.exports = {
  createCampaign
};


