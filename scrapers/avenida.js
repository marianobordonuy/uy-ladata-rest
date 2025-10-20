// scrapers/avenida.js
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://cotizador.avenida.com.uy/cotizaciones-home/";

async function scrapeAvenida() {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
  });

  const $ = cheerio.load(response.data);

  // Buscar la fila del Dólar o USD
  const row = $("tr").filter((i, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes("dólar") || text.includes("usd");
  }).first();

  if (!row.length) {
    throw new Error("No se encontró la fila del dólar en Avenida");
  }

  // Buscar las dos celdas numéricas (compra / venta)
  const cells = row.find("td").map((i, el) => $(el).text().trim()).get();
  // Ejemplo: ["DÓLAR USA", "39.20", "41.70"]

  const buy = Number(cells[1].replace(",", "."));
  const sell = Number(cells[2].replace(",", "."));

  if (isNaN(buy) || isNaN(sell)) {
    throw new Error("No se pudieron extraer los valores de compra/venta");
  }

  return {
    source: "Avenida",
    currency: "USD",
    buy,
    sell,
    timestamp: new Date(),
  };
}

module.exports = scrapeAvenida;

// Ejemplo rápido:
// scrapeAvenida().then(console.log).catch(console.error);
