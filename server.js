require('dotenv').config();
const express = require('express');
const logger = require('./src/utils/logger');
const { validate } = require('./src/middleware/validation');
const { authenticateToken } = require('./src/middleware/auth');
const { generalLimiter } = require('./src/utils/rateLimiter');

const {
  connectAccountSchema,
  createCampaignSchema,
  generateAdCopySchema,
  batchCreateAdsSchema
} = require('./src/validators/schemas');

const { connectAccount, refreshToken } = require('./src/controllers/accountController');
const { createCampaign } = require('./src/controllers/campaignController');
const { generateAdCopy } = require('./src/controllers/adCopyController');
const { batchCreateAds } = require('./src/controllers/adsController');
const { fetchAnalytics } = require('./src/controllers/analyticsController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/connect-account', validate(connectAccountSchema), connectAccount);

app.post('/refresh-token', refreshToken);

app.post('/create-campaign', validate(createCampaignSchema), createCampaign);

app.post('/generate-ad-copy', validate(generateAdCopySchema), generateAdCopy);

app.post('/batch-create-ads', validate(batchCreateAdsSchema), batchCreateAds);

app.get('/fetch-analytics', fetchAnalytics);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server started on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST /connect-account');
    console.log('  POST /refresh-token');
    console.log('  POST /create-campaign');
    console.log('  POST /generate-ad-copy');
    console.log('  POST /batch-create-ads');
    console.log('  GET  /fetch-analytics');
  });
}

module.exports = app;


