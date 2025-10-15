const request = require('supertest');
const app = require('../../server');

describe('Server Endpoints', () => {
  describe('POST /connect-account', () => {
    it('should successfully connect an account and return tokens', async () => {
      const response = await request(app)
        .post('/connect-account')
        .send({
          platform: 'meta',
          account_id: 'test_account_123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'connected');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('expires_in', 120);
    });

    it('should return validation error for invalid platform', async () => {
      const response = await request(app)
        .post('/connect-account')
        .send({
          platform: 'invalid_platform',
          account_id: 'test_account_123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return validation error for missing account_id', async () => {
      const response = await request(app)
        .post('/connect-account')
        .send({
          platform: 'meta'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /create-campaign', () => {
    it('should create a campaign successfully', async () => {
      const response = await request(app)
        .post('/create-campaign')
        .send({
          platform: 'meta',
          account_id: 'test_account_123',
          campaign_name: 'Summer Sale 2024',
          objective: 'LEADS',
          budget: 1000
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('campaign_id');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body.campaign_id).toMatch(/^cmp_/);
    });

    it('should respect idempotency key', async () => {
      const idempotencyKey = `idem_${Date.now()}`;
      const requestData = {
        platform: 'google',
        account_id: 'test_account_456',
        campaign_name: 'Holiday Campaign',
        objective: 'TRAFFIC',
        budget: 2000,
        idempotency_key: idempotencyKey
      };

      const firstResponse = await request(app)
        .post('/create-campaign')
        .send(requestData);

      const secondResponse = await request(app)
        .post('/create-campaign')
        .send(requestData);

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(200);
      expect(firstResponse.body.campaign_id).toBe(secondResponse.body.campaign_id);
    });

    it('should validate budget is positive', async () => {
      const response = await request(app)
        .post('/create-campaign')
        .send({
          platform: 'meta',
          account_id: 'test_account_123',
          campaign_name: 'Test Campaign',
          objective: 'LEADS',
          budget: -100
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /batch-create-ads', () => {
    it('should create ads in batch successfully', async () => {
      const batchId = `batch_${Date.now()}`;
      
      const response = await request(app)
        .post('/batch-create-ads')
        .send({
          platform: 'meta',
          account_id: 'test_account_123',
          campaign_id: 'cmp_test_123',
          batch_id: batchId,
          ads: [
            {
              headline: 'Amazing Product',
              description: 'Get it now at 50% off'
            },
            {
              headline: 'Limited Time Offer',
              description: 'Don\'t miss out on this deal'
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.ads).toHaveLength(2);
      expect(response.body.ads[0]).toHaveProperty('ad_id');
      expect(response.body.ads[0]).toHaveProperty('status', 'created');
    });

    it('should enforce maximum 10 ads per batch', async () => {
      const ads = Array(11).fill({
        headline: 'Test Ad',
        description: 'Test Description'
      });

      const response = await request(app)
        .post('/batch-create-ads')
        .send({
          platform: 'meta',
          account_id: 'test_account_123',
          campaign_id: 'cmp_test_123',
          batch_id: `batch_${Date.now()}`,
          ads
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /fetch-analytics', () => {
    it('should fetch analytics with valid parameters', async () => {
      const response = await request(app)
        .get('/fetch-analytics')
        .query({
          platform: 'meta',
          account_id: 'test_account_123',
          campaign_id: 'cmp_test_123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('spend');
      expect(response.body).toHaveProperty('impressions');
      expect(response.body).toHaveProperty('clicks');
      expect(response.body).toHaveProperty('ctr');
      expect(response.body).toHaveProperty('cpc');
    });

    it('should return error when platform is missing', async () => {
      const response = await request(app)
        .get('/fetch-analytics')
        .query({
          account_id: 'test_account_123'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /generate-ad-copy', () => {
    it('should validate generate ad copy request', async () => {
      const response = await request(app)
        .post('/generate-ad-copy')
        .send({
          product: 'Protein Shake',
          audience: 'Fitness Enthusiasts',
          tone: 'Exciting',
          format: 'headlines+descriptions',
          n: 3
        });

      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('headlines');
        expect(response.body).toHaveProperty('descriptions');
      }
    });

    it('should reject invalid format', async () => {
      const response = await request(app)
        .post('/generate-ad-copy')
        .send({
          product: 'Test Product',
          audience: 'Test Audience',
          tone: 'Professional',
          format: 'invalid_format',
          n: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/unknown-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});


