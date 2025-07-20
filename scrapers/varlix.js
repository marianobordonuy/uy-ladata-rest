const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.varlix.com.uy/';

async function scrapeVarlix() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const row = $('.exchange-line:contains("Dólar")').first();
    const compra = row.find('.buy').text();
    const venta = row.find('.sell').text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Varlix',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeVarlix;
