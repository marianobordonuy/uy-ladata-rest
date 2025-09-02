const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.gales.com.uy/home/';

async function scrapeGales() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const compra = $('div:nth-child(2) > table.monedas tbody > tr:nth-child(1) > td:nth-child(2)').text();
    const venta = $('div:nth-child(2) > table.monedas tbody > tr:nth-child(1) > td:nth-child(3)').text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Gales',
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeGales;
