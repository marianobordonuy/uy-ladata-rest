const axios = require('axios');
const cheerio = require('cheerio');

const url = 'http://cambios.instyledm.com/5/cotizaciones.html';

async function scrapeMaiorano() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const row = $('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3)');
    const compra = row.find('td:nth-child(3)').text();
    const venta = row.find('td:nth-child(4)').text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Maiorano',
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeMaiorano;
