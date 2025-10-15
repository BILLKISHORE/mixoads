const Joi = require('joi');

const connectAccountSchema = Joi.object({
  platform: Joi.string().valid('meta', 'google', 'tiktok').required(),
  account_id: Joi.string().min(1).required()
});

const createCampaignSchema = Joi.object({
  platform: Joi.string().valid('meta', 'google', 'tiktok').required(),
  account_id: Joi.string().min(1).required(),
  campaign_name: Joi.string().min(1).max(255).required(),
  objective: Joi.string().valid('LEADS', 'TRAFFIC', 'AWARENESS').required(),
  budget: Joi.number().positive().required(),
  idempotency_key: Joi.string().optional()
});

const generateAdCopySchema = Joi.object({
  product: Joi.string().min(1).max(500).required(),
  audience: Joi.string().min(1).max(500).required(),
  tone: Joi.string().min(1).max(100).required(),
  format: Joi.string().valid('headlines+descriptions', 'headlines', 'descriptions').required(),
  n: Joi.number().integer().min(1).max(10).default(3)
});

const batchCreateAdsSchema = Joi.object({
  platform: Joi.string().valid('meta', 'google').required(),
  account_id: Joi.string().min(1).required(),
  campaign_id: Joi.string().min(1).required(),
  ads: Joi.array().items(
    Joi.object({
      headline: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(1000).required(),
      image_base64: Joi.string().optional()
    })
  ).min(1).max(10).required(),
  batch_id: Joi.string().required()
});

module.exports = {
  connectAccountSchema,
  createCampaignSchema,
  generateAdCopySchema,
  batchCreateAdsSchema
};


