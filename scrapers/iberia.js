const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.cambioiberia.com/';

async function scrapeIberia() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const compra = $('li:contains("Dólar") div:nth-child(3)').first().text();
    const venta = $('li:contains("Dólar") div:nth-child(4)').first().text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Iberia',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeIberia;
