// scrapers/brimar.js
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.brimar.com.uy/cotizaciones.html";

async function scrapeBrimar() {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Busca el texto que sigue a la palabra "Dólar" (compra/venta)
  const body = $("body").text().replace(/\s+/g, " ");
  const match = body.match(
    /Dólar:?[\s:–-]{0,20}(\d{1,3}[.,]\d{2})\s*[\/|]\s*(\d{1,3}[.,]\d{2})/i
  );

  if (!match) {
    throw new Error("No se encontró la cotización del dólar en Brimar");
  }

  const buy = Number(match[1].replace(",", "."));
  const sell = Number(match[2].replace(",", "."));

  return {
    source: "Brimar",
    currency: "USD",
    buy,
    sell,
    timestamp: new Date(),
  };
}

module.exports = scrapeBrimar;