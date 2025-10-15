# Mixoads Backend Integration Challenge

A production-ready backend service that simulates ad platform integrations (Meta, Google, TikTok) with OpenAI-powered ad copy generation. Built with Node.js and Express, featuring token management, rate limiting, idempotency, automatic retries, and comprehensive logging.

## Features

- **Multi-Platform Support**: Integrates with Meta, Google, and TikTok ad platforms
- **OpenAI Integration**: AI-powered ad copy generation with few-shot prompting
- **Token Management**: OAuth-like flow with access/refresh tokens and automatic expiration
- **Idempotency**: Campaign and batch ad creation with idempotency key support
- **Rate Limiting**: Per-platform rate limits to prevent API abuse
- **Retry Logic**: Exponential backoff with jitter for failed requests
- **Structured Logging**: Winston-based logging with timestamps and context
- **Input Validation**: Joi schemas for request validation
- **Unit Tests**: Comprehensive test coverage with Jest
- **Docker Support**: Containerized deployment ready

## Tech Stack

- Node.js 18+
- Express.js
- OpenAI API (GPT-5)
- Winston (logging)
- Joi (validation)
- Jest + Supertest (testing)
- Docker

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key (get one at https://platform.openai.com)
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mixoads-backend-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp env.example .env
```

4. Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3000
NODE_ENV=development
```

## Running the Application

### Local Development

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Docker

Build the Docker image:
```bash
docker build -t mixoads-backend .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env mixoads-backend
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## API Endpoints

### 1. POST /connect-account
Simulates OAuth-like account connection and generates tokens.

**Request:**
```json
{
  "platform": "meta",
  "account_id": "test_account_123"
}
```

**Response:**
```json
{
  "status": "connected",
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 120
}
```

### 2. POST /create-campaign
Creates a new ad campaign with automatic retry and idempotency support.

**Request:**
```json
{
  "platform": "meta",
  "account_id": "test_account_123",
  "campaign_name": "Summer Sale 2024",
  "objective": "LEADS",
  "budget": 1000,
  "idempotency_key": "idem_summer_2024"
}
```

**Response:**
```json
{
  "status": "success",
  "campaign_id": "cmp_meta_abc123",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### 3. POST /generate-ad-copy
Generates ad copy using OpenAI with few-shot prompting.

**Request:**
```json
{
  "product": "Protein Shake",
  "audience": "Fitness Enthusiasts",
  "tone": "Exciting",
  "format": "headlines+descriptions",
  "n": 3
}
```

**Response:**
```json
{
  "status": "success",
  "headlines": [
    "Fuel Your Gains With Every Shake",
    "Transform Your Body. One Scoop At A Time",
    "Unleash Your Peak Performance"
  ],
  "descriptions": [
    "Packed with 30g of pure whey protein...",
    "Delicious flavors that make hitting your macros...",
    "The ultimate post-workout fuel..."
  ]
}
```

### 4. POST /batch-create-ads
Creates multiple ads in a single batch (max 10 ads).

**Request:**
```json
{
  "platform": "meta",
  "account_id": "test_account_123",
  "campaign_id": "cmp_meta_abc123",
  "batch_id": "batch_001",
  "ads": [
    {
      "headline": "Amazing Product",
      "description": "Get it now at 50% off",
      "image_base64": "optional_base64_string"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "ads": [
    {
      "ad_id": "ad_meta_xyz789",
      "status": "created"
    }
  ]
}
```

### 5. GET /fetch-analytics
Fetches campaign analytics (mock data).

**Request:**
```
GET /fetch-analytics?platform=meta&account_id=test_account_123&campaign_id=cmp_meta_abc123
```

**Response:**
```json
{
  "spend": 245.67,
  "impressions": 25000,
  "clicks": 850,
  "ctr": 0.034,
  "cpc": 0.29
}
```

### Additional Endpoints

- **POST /refresh-token**: Refresh an expired access token
- **GET /health**: Health check endpoint

## Using Postman

1. Import `postman_collection.json` into Postman
2. The collection includes all endpoints with sample requests
3. Collection variables will auto-populate (access_token, campaign_id, etc.)
4. Run requests in order for best results (Connect Account → Create Campaign → etc.)

## Implementation Details

### Token Management
- Access tokens expire after 120 seconds
- Refresh tokens can be used to obtain new access tokens
- Tokens are stored in-memory (Map structure)
- Automatic cleanup on expiration

### Idempotency
- Campaign creation supports idempotency keys
- Batch ad creation uses batch_id for idempotency
- Cached responses valid for 24 hours
- Prevents duplicate operations

### Rate Limiting
- Meta: 20 requests/minute
- Google: 15 requests/minute
- TikTok: 10 requests/minute
- General: 100 requests/15 minutes

### Retry Logic
- Exponential backoff with jitter
- Default 3 retries with 1s base delay
- Retries on network errors and 5xx responses
- Configurable per operation

### Logging
- Winston-based structured logging
- Separate error and combined log files
- Console output in development
- Request/response tracking with context

### OpenAI Integration
- Few-shot prompting with examples
- GPT-5 model
- Automatic retry on failures
- Fallback responses if parsing fails

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `LOG_LEVEL` | Logging level (info/debug/error) | info |

## Testing

The project includes comprehensive unit tests covering:
- All API endpoints
- Token generation and validation
- Token refresh mechanism
- Idempotency behavior
- Input validation
- Error handling

Test files:
- `src/__tests__/server.test.js`: API endpoint tests
- `src/__tests__/tokenManager.test.js`: Token management tests

## Production Considerations

### Current Implementation
- In-memory storage (suitable for single-instance deployments)
- Mock ad platform calls (no actual API calls)
- Basic security (extend with helmet, CORS, etc.)

### For Production Deployment
1. **Database**: Replace in-memory Maps with Redis or PostgreSQL
2. **Authentication**: Implement proper OAuth2 flow
3. **Security**: Add helmet, CORS, rate limiting per user
4. **Monitoring**: Integrate APM (e.g., DataDog, New Relic)
5. **Secrets Management**: Use AWS Secrets Manager or Vault
6. **Load Balancing**: Deploy behind nginx or AWS ALB
7. **Caching**: Add Redis for distributed caching
8. **Queue System**: Use Bull or AWS SQS for batch operations

## Troubleshooting

### OpenAI API Key Issues
If you see "OpenAI API key not configured" errors:
1. Verify `.env` file exists and contains `OPENAI_API_KEY`
2. Restart the server after adding the key
3. Check the key is valid at https://platform.openai.com

### Port Already in Use
If port 3000 is occupied:
1. Change `PORT` in `.env` file
2. Or kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

### Test Failures
If tests fail:
1. Ensure no server is running on port 3000
2. Run `npm install` to ensure all dependencies are installed
3. Check Node.js version (18+ required)

## License

ISC

## Author

Built for Mixoads Backend Integration Challenge



# mixoads
