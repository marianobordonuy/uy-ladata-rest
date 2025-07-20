const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.valsf.com.uy/mvdexchange/apizarradeldia.aspx';

async function scrapeVal() {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const compra = $('tbody > tr:nth-child(1) > td:nth-child(2)').first().text();
    const venta = $('tbody > tr:nth-child(1) > td:nth-child(3)').first().text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Val',
        url,
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeVal;
