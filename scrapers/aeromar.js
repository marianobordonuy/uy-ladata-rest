const axios = require('axios');
const cheerio = require('cheerio');

const url = 'http://www.aeromar.com.uy/';

async function scrapeAeromar() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const compra = $('div > div:nth-child(2) > p:nth-child(2)').first().text();
    const venta = $('div > div:nth-child(3) > p:nth-child(2)').first().text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Aeromar',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeAeromar;
