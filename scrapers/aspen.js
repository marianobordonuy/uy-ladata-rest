const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.aspen.com.uy/sitio/';

async function scrapeAspen() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const row = $('.md-cotizaciones .bd:contains("DÓLAR")').first();
    const compra = row.find('.valor').first().text();
    const venta = row.find('.valor').eq(1).text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Aspen',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeAspen;
