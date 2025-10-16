// scrapers/cambio18.js
const axios = require("axios");
const cheerio = require("cheerio");

const URL = "https://www.cambio18.com/cotizaciones";

function toNumber(s) {
  return Number(String(s).trim().replace(/\s+/g, " ").replace(",", "."));
}

async function scrapeCambio18() {
  const { data: html } = await axios.get(URL, {
    timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; uy-ladata-rest/1.0)" },
  });

  const $ = cheerio.load(html);
  const body = $("body").text().replace(/\s+/g, " ");

  // Busca la fila “DÓLAR … compra … venta” (dos números cerca)
  const m = body.match(/D[ÓO]LAR[\s:–-]{0,20}(\d{1,3}[.,]\d{2})\s+(\d{1,3}[.,]\d{2})/i);
  if (!m) throw new Error("No se encontró la cotización de DÓLAR en Cambio 18");

  const buy = toNumber(m[1]);
  const sell = toNumber(m[2]);

  return {
    source: "Cambio 18",
    currency: "USD",
    buy,
    sell,
    timestamp: new Date(),
  };
}

module.exports = scrapeCambio18;