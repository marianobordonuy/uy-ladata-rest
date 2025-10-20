// scrapers/cambio18.js
const axios = require("axios");
const cheerio = require("cheerio");

const URLS = [
  "https://www.cambio18.com/cotizaciones",
  "https://www.cambio18.com/",
];

// Normaliza "38,75" -> 38.75
function toNumber(s) {
  if (!s) return NaN;
  // Si usa coma decimal → cambiarla a punto
  if (s.includes(",")) s = s.replace(",", ".");
  // Eliminar espacios y caracteres extraños
  s = s.replace(/[^\d.]/g, "");
  return parseFloat(s);
}

// Intenta extraer USD desde una tabla <tr> que contenga "DÓLAR" o "USD".
// Si la tabla falla, aplica un regex de respaldo sobre el texto del body.
function extractUsd(html) {
  const $ = cheerio.load(html);

  // 1) Tabla
  const row = $("tr")
    .filter((_, el) => {
      const t = $(el).text().toLowerCase();
      return t.includes("dólar") || /\busd\b/i.test(t);
    })
    .first();

  if (row.length) {
    const cells = row.find("td, th").map((_, el) => $(el).text().trim()).get();
    // Suele venir: ["DÓLAR", "38.75", "41.15"]
    // Busca los dos primeros números de la fila:
    const nums = cells
      .map((c) => c.replace(/[^\d.,]/g, ""))
      .filter((c) => /\d/.test(c));
    if (nums.length >= 2) {
      const buy = toNumber(nums[0]);
      const sell = toNumber(nums[1]);
      if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
    }
  }

  // 2) Respaldo por regex en texto plano (ej. "DÓLAR 38.75 41.15" o "38,75 / 41,15")
  const body = $("body").text().replace(/\s+/g, " ");
  const m =
    body.match(
      /D[óo]lar[^0-9]{0,40}(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*[/ -]\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i
    ) ||
    body.match(
      /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*[/ -]\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:UYU)?\s*(?:D[óo]lar|USD)/i
    );
  if (m) {
    const buy = toNumber(m[1]);
    const sell = toNumber(m[2]);
    if (!isNaN(buy) && !isNaN(sell)) return { buy, sell };
  }

  return null;
}

async function scrapeCambio18() {
  let lastErr;
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

      const parsed = extractUsd(res.data);
      if (parsed) {
        return {
          source: "Cambio 18",
          urlUsed: url,
          currency: "USD",
          buy: parsed.buy,
          sell: parsed.sell,
          timestamp: new Date(),
        };
      }
      lastErr = new Error("No se pudo parsear USD desde " + url);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Fallo desconocido en Cambio 18");
}

module.exports = scrapeCambio18;

// Prueba rápida:
// scrapeCambio18().then(console.log).catch(console.error);
