# Quick Setup Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
Server started on http://localhost:3000
```

### Step 4: Test with Postman
1. Open Postman
2. Import `postman_collection.json`
3. Run the "Health Check" request to verify server is running
4. Run requests in order:
   - Connect Account
   - Create Campaign
   - Generate Ad Copy
   - Batch Create Ads
   - Fetch Analytics

### Step 5: Run Tests
```bash
npm test
```

## Testing Individual Endpoints with cURL

### Connect Account
```bash
curl -X POST http://localhost:3000/connect-account \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "meta",
    "account_id": "test_123"
  }'
```

### Create Campaign
```bash
curl -X POST http://localhost:3000/create-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "meta",
    "account_id": "test_123",
    "campaign_name": "Test Campaign",
    "objective": "LEADS",
    "budget": 1000
  }'
```

### Generate Ad Copy (requires OpenAI API key)
```bash
curl -X POST http://localhost:3000/generate-ad-copy \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Protein Shake",
    "audience": "Fitness Enthusiasts",
    "tone": "Exciting",
    "format": "headlines+descriptions",
    "n": 3
  }'
```

## Docker Quick Start

### Build
```bash
docker build -t mixoads-backend .
```

### Run
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key_here \
  mixoads-backend
```

## Troubleshooting

### Issue: Module not found
**Solution:** Run `npm install`

### Issue: Port 3000 in use
**Solution:** Change PORT in `.env` or stop the other process

### Issue: OpenAI API errors
**Solution:** Verify your API key in `.env` file

### Issue: Tests failing
**Solution:** Make sure no server is running on port 3000 during tests

## What to Submit

1. **GitHub Repository**: Push all code (excluding `.env` and `node_modules`)
2. **Postman Collection**: Include `postman_collection.json`
3. **README**: Already included
4. **Optional Loom**: Record a 2-5 minute walkthrough

## Key Features Implemented

- All 5 required endpoints
- Token generation and refresh mechanism
- Idempotency for campaigns and batch ads
- Rate limiting per platform
- Exponential backoff retry logic
- OpenAI integration with few-shot prompting
- Structured logging with Winston
- Input validation with Joi
- Comprehensive unit tests
- Docker support
- Production-ready error handling

## Next Steps

1. Add your actual OpenAI API key to `.env`
2. Test all endpoints
3. Review the code structure
4. Run the test suite
5. Try the Docker deployment
6. Prepare your submission

Good luck with your assessment!


