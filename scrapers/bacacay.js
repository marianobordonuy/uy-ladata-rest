// scrapers/bacacaysf.js
const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.bacacaysf.com/cotizaciones.php';

async function scrapeBacacay() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Busca la fila que contenga la palabra "Dólar"
    const row = $('table tr').filter((i, el) =>
        $(el).text().toLowerCase().includes('Dolar USA')
    ).first();

    const compra = row.find('td:nth-child(2)').text();
    const venta  = row.find('td:nth-child(3)').text();

    const buy  = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Bacacay SF',
        currency: 'USD',
        buy,
        sell,
        timestamp
    };
}

module.exports = scrapeBacacay;