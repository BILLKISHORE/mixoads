const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');

async function generateAdCopy(req, res) {
  try {
    const { product, audience, tone, format, n } = req.validatedBody;

    const result = await openaiService.generateAdCopy(
      product,
      audience,
      tone,
      format,
      n
    );

    res.status(200).json({
      status: 'success',
      headlines: result.headlines,
      descriptions: result.descriptions
    });
  } catch (error) {
    logger.error('Failed to generate ad copy', { error: error.message });
    
    if (error.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenAI API key not configured'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to generate ad copy',
      details: error.message
    });
  }
}

module.exports = {
  generateAdCopy
};


