const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.cambilex.com.uy/';

async function scrapeCambilex() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const row = $('.cotizacion:contains("Dolares")').first();
    const compra = row.find('.compra').text();
    const venta = row.find('.venta').text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Cambilex',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeCambilex;
