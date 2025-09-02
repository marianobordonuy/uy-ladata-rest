const axios = require('axios');

const bandesUrl = 'https://www.bandes.com.uy/api/marketRates';

async function scrapeBandes() {
  try {
    const response = await axios.get(bandesUrl);
    const data = response.data;

    const buyRaw = Array.isArray(data.buyPrices) && data.buyPrices.length > 0 ? data.buyPrices[0] : null;
    const sellRaw = Array.isArray(data.sellPrices) && data.sellPrices.length > 0 ? data.sellPrices[0] : null;

    const buy = buyRaw ? Number(buyRaw) : null;
    const sell = sellRaw ? Number(sellRaw) : null;

    const timestamp = new Date();

    return {
      source: 'Bandes',
      currency: 'USD',
      buy,
      sell,
      media: (buy !== null && sell !== null) ? (buy + sell) / 2 : null,
      timestamp
    };
  } catch (error) {
    console.error('Error scraping Bandes:', error.message);
    return null;
  }
}

module.exports = scrapeBandes;
