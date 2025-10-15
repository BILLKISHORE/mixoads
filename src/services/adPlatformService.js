const crypto = require('crypto');
const logger = require('../utils/logger');
const { withRetry } = require('../utils/retry');

class AdPlatformService {
  constructor() {
    this.campaigns = new Map();
    this.ads = new Map();
  }

  async createCampaign(platform, accountId, campaignName, objective, budget) {
    logger.info('Creating campaign', { platform, accountId, campaignName, objective, budget });

    const createFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (Math.random() < 0.1) {
        const error = new Error('Platform temporarily unavailable');
        error.response = { status: 503 };
        throw error;
      }

      const campaignId = `cmp_${platform}_${crypto.randomBytes(8).toString('hex')}`;
      const campaignData = {
        campaignId,
        platform,
        accountId,
        campaignName,
        objective,
        budget,
        createdAt: new Date().toISOString()
      };

      this.campaigns.set(campaignId, campaignData);

      logger.info('Campaign created successfully', { campaignId, platform });

      return {
        campaign_id: campaignId,
        created_at: campaignData.createdAt
      };
    };

    return await withRetry(createFn, {
      maxRetries: 3,
      baseDelay: 1000
    });
  }

  async batchCreateAds(platform, accountId, campaignId, ads, batchId) {
    logger.info('Batch creating ads', { 
      platform, 
      accountId, 
      campaignId, 
      batchId,
      adCount: ads.length 
    });

    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const createFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 200));

      const createdAds = ads.map((ad, index) => {
        const adId = `ad_${platform}_${crypto.randomBytes(6).toString('hex')}`;
        const adData = {
          adId,
          campaignId,
          platform,
          accountId,
          headline: ad.headline,
          description: ad.description,
          imageBase64: ad.image_base64,
          status: 'created',
          createdAt: new Date().toISOString()
        };

        this.ads.set(adId, adData);

        return {
          ad_id: adId,
          status: 'created'
        };
      });

      logger.info('Ads created successfully', { 
        batchId,
        adCount: createdAds.length 
      });

      return createdAds;
    };

    return await withRetry(createFn, {
      maxRetries: 2,
      baseDelay: 1500
    });
  }

  async fetchAnalytics(platform, accountId, campaignId) {
    logger.info('Fetching analytics', { platform, accountId, campaignId });

    await new Promise(resolve => setTimeout(resolve, 50));

    const baseMetrics = {
      meta: { spend: 245.67, impressions: 25000, clicks: 850 },
      google: { spend: 189.34, impressions: 18500, clicks: 620 },
      tiktok: { spend: 156.78, impressions: 32000, clicks: 720 }
    };

    const metrics = baseMetrics[platform] || baseMetrics.meta;
    const ctr = metrics.clicks / metrics.impressions;
    const cpc = metrics.spend / metrics.clicks;

    const analytics = {
      spend: parseFloat(metrics.spend.toFixed(2)),
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      ctr: parseFloat(ctr.toFixed(4)),
      cpc: parseFloat(cpc.toFixed(2))
    };

    logger.info('Analytics fetched', { platform, analytics });

    return analytics;
  }
}

module.exports = new AdPlatformService();


