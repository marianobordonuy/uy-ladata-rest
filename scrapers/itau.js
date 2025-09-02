const axios = require('axios');
const cheerio = require('cheerio');

const itauUrl = 'https://www.itau.com.uy/inst/aci/cotiz.xml';

async function scrapeItau() {
    const response = await axios.get(itauUrl, {
        params: { format: "xml", paymentType: "ach" },
        responseType: "document",
    });

    const $ = cheerio.load(response.data);
    const compra = $("cotizacion:nth-child(7) > compra").text();
    const venta = $("cotizacion:nth-child(7) > venta").text();

    const buy = Number(compra.replace(',', '.'));
    const sell = Number(venta.replace(',', '.'));
    const timestamp = new Date();

    return {
        source: 'Itau',
        currency: 'USD',
        buy,
        sell,
        media: (buy + sell) / 2,
        timestamp
    };
}

module.exports = scrapeItau;
