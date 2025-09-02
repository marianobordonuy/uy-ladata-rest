const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://altercambio.com.uy/';

async function scrapeAlter() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const row = $('.pizarra tr:contains("Dolar")');
    const compra = row.find('.usd_compra').text();
    const venta = row.find('.usd_venta').text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Alter',
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeAlter;
