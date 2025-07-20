const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.delta.uy/';

async function scrapeDelta() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const compra = $('tbody > tr:nth-child(1) > td:nth-child(3)').first().text();
    const venta = $('tbody > tr:nth-child(1) > td:nth-child(4)').first().text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Delta',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeDelta;
