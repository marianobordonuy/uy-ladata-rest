// scrapers/eurodracma.js
const axios = require("axios");
const cheerio = require("cheerio");

const URLS = [
  "https://eurodracma.com/cotizaciones/",
  "https://eurodracma.com/",
];

// Normaliza "38,95" -> 38.95
function toNumber(s) {
  return Number(String(s).replace(",", "."));
}

// Intenta extraer USD con dos estrategias:
// A) Cerca del literal "DÓLAR AMERICANO" con formato "NN.NN / NN.NN"
// B) Línea de banner: "DÓLAR: NN.NN - NN.NN"
function extractUsdFromHtml(html) {
  const $ = cheerio.load(html);

  // 1) Texto plano del body para regex global (más tolerante)
  const body = $("body").text().replace(/\s+/g, " ");

  // A) Dólar Americano con barra
  let m =
    body.match(
      /D[óo]lar\s+Americano[^0-9]{0,50}(\d{1,3}[.,]\d{2})\s*\/\s*(\d{1,3}[.,]\d{2})/i
    ) ||
    // Por si cambian a “Dólar USA” o “USD”
    body.match(
      /(D[óo]lar\s+(USA|U\.S\.A\.|Usd|USD)|USD)[^0-9]{0,50}(\d{1,3}[.,]\d{2})\s*\/\s*(\d{1,3}[.,]\d{2})/i
    );

  if (m) {
    const buy = toNumber(m[m.length - 2]);
    const sell = toNumber(m[m.length - 1]);
    if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
  }

  // B) Banner con guion: "DÓLAR: 38.95 - 41.35"
  m = body.match(
    /D[óo]lar[^0-9]{0,20}[:\-–—]\s*(\d{1,3}[.,]\d{2})\s*[-/]\s*(\d{1,3}[.,]\d{2})/i
  );
  if (m) {
    const buy = toNumber(m[1]);
    const sell = toNumber(m[2]);
    if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
  }

  // 2) DOM: buscar un nodo que contenga “DÓLAR AMERICANO” y capturar números cercanos
  const node = $('*:contains("DÓLAR AMERICANO"), *:contains("Dólar Americano"), *:contains("Dolar Americano")').first();
  if (node.length) {
    const textNearby = node.parent().text().replace(/\s+/g, " ");
    m = textNearby.match(/(\d{1,3}[.,]\d{2})\s*\/\s*(\d{1,3}[.,]\d{2})/);
    if (m) {
      const buy = toNumber(m[1]);
      const sell = toNumber(m[2]);
      if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
    }
  }

  return null;
}

async function scrapeEurodracma() {
  let lastError;
  for (const url of URLS) {
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
          "Accept-Language": "es-UY,es;q=0.9,en;q=0.8",
        },
        timeout: 12000,
      });

      const parsed = extractUsdFromHtml(res.data);
      if (parsed) {
        return {
          source: "Eurodracma",
          urlUsed: url,
          currency: "USD",
          buy: parsed.buy,
          sell: parsed.sell,
          timestamp: new Date(),
        };
      }
      lastError = new Error("No se pudo parsear USD desde " + url);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Fallo desconocido en Eurodracma");
}

module.exports = scrapeEurodracma;

// Prueba rápida:
// scrapeEurodracma().then(console.log).catch(console.error);
