const OpenAI = require('openai');
const logger = require('../utils/logger');
const { withRetry } = require('../utils/retry');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY not set. OpenAI features will be disabled.');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  buildPrompt(product, audience, tone, format) {
    const fewShotExamples = `You are a high-performance ad copywriter. Generate short, conversion-focused creatives.

Example 1:
Product: Noise-cancelling headphones
Audience: Remote workers
Tone: Professional
Headlines:
- Work Without Distractions. Premium Noise Cancellation
- Focus On What Matters. Block Out The World
- Your Personal Sound Sanctuary For Work

Descriptions:
- Experience crystal-clear calls and deep focus with industry-leading noise cancellation technology
- Designed for professionals who demand excellence in sound quality and comfort during long work sessions
- Premium audio meets ergonomic design for all-day productivity

Example 2:
Product: Protein Shake
Audience: Fitness Enthusiasts
Tone: Exciting
Headlines:
- Fuel Your Gains With Every Shake
- Transform Your Body. One Scoop At A Time
- Unleash Your Peak Performance

Descriptions:
- Packed with 30g of pure whey protein to support muscle growth and recovery after intense workouts
- Delicious flavors that make hitting your macros easy and enjoyable every single day
- The ultimate post-workout fuel trusted by athletes and gym-goers worldwide

Task: Generate ${format.includes('headlines') ? 'headlines' : ''} ${format.includes('descriptions') ? 'and descriptions' : ''} for:
Product: ${product}
Audience: ${audience}
Tone: ${tone}

Provide the output in JSON format with "headlines" and "descriptions" arrays.`;

    return fewShotExamples;
  }

  async generateAdCopy(product, audience, tone, format, n = 3) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
    }

    const prompt = this.buildPrompt(product, audience, tone, format);

    logger.info('Generating ad copy', { product, audience, tone, format, n });

    const generateFn = async () => {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert ad copywriter. Always respond with valid JSON containing "headlines" and "descriptions" arrays.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      const responseText = completion.choices[0].message.content.trim();
      
      let parsed;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(responseText);
        }
      } catch (e) {
        logger.error('Failed to parse OpenAI response', { responseText });
        throw new Error('Invalid JSON response from OpenAI');
      }

      const headlines = (parsed.headlines || []).slice(0, n);
      const descriptions = (parsed.descriptions || []).slice(0, n);

      while (headlines.length < n) {
        headlines.push(`${product} - Perfect for ${audience}`);
      }
      while (descriptions.length < n) {
        descriptions.push(`Discover the best ${product} tailored for ${audience}.`);
      }

      logger.info('Ad copy generated successfully', { 
        headlineCount: headlines.length,
        descriptionCount: descriptions.length
      });

      return { headlines, descriptions };
    };

    return await withRetry(generateFn, {
      maxRetries: 3,
      baseDelay: 2000,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
    });
  }
}

module.exports = new OpenAIService();


