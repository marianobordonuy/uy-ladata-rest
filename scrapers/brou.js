// scrapers/brou.js
const axios = require("axios");
const cheerio = require("cheerio");

const BROU_COMPACT_URL =
  "https://www.brou.com.uy/c/portal/render_portlet?p_p_id=cotizacion_WAR_broutmfportlet_INSTANCE_df0HsIO8xsuv&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&p_l_id=20185&p_p_isolated=1";

const TTL_MS = 120000;
let CACHE = { ts: 0, payload: null };

function toNumber(s) {
  if (!s) return null;
  return Number(String(s).trim().replace(/\./g, "").replace(",", "."));
}

module.exports = async function scrapeBrou() {
  const now = Date.now();
  if (CACHE.payload && now - CACHE.ts < TTL_MS) {
    return { ...CACHE.payload, cached: true };
  }

  try {
    const resp = await axios.get(BROU_COMPACT_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (debug uy-ladata-rest)",
        Referer: "https://www.brou.com.uy/cotizaciones"
      },
      timeout: 15000
    });


    // 👀 DEBUG: ver status y primeros caracteres del HTML
    //console.log("BROU status:", resp.status);
    //console.log("BROU length:", typeof resp.data === "string" ? resp.data.length : "no-string");

    // Si querés ver TODO el HTML:
    //if (process.env.DEBUG_BROU === "true") {
    //  require("fs").writeFileSync("./brou_debug.html", resp.data);
    //  console.log("HTML completo guardado en brou_debug.html");
    //}

    const $ = cheerio.load(resp.data);
    let buy = null, sell = null;

// reemplazá SOLO el bloque que recorre filas y asigna buy/sell

const moneyRe = /(\d{1,3}(?:\.\d{3})*,\d{1,4})/g; // ej: 39,30 | 1.234,56

$("table tr, tr").each((_, tr) => {
  const cells = $(tr)
    .find("th,td")
    .map((i, el) => $(el).text().trim().replace(/\s+/g, " "))
    .get();

  if (cells.length && /d[óo]lar ebrou/i.test(cells[0])) {
    // Buscar TODOS los números válidos en la fila
    const nums = (cells.join(" ").match(moneyRe) || []).map(s =>
      Number(s.replace(/\./g, "").replace(",", "."))
    );

    // Debe haber al menos 2 números (compra y venta)
    if (nums.length >= 2) {
      buy = nums[0];                // primero que aparece = compra
      sell = nums[nums.length - 1]; // último que aparece = venta
      //console.log("eBROU nums:", nums, "=> buy:", buy, "sell:", sell);
    } else {
      // Fallback por índice (por si justo hay 4 celdas con la 3ra vacía)
      const maybeBuy = Number(String(cells[1] || "").replace(/\./g, "").replace(",", "."));
      const maybeSell = Number(String(cells[3] || cells[2] || "").replace(/\./g, "").replace(",", "."));
      if (Number.isFinite(maybeBuy) && Number.isFinite(maybeSell)) {
        buy = maybeBuy;
        sell = maybeSell;
        //console.log("eBROU fallback idx => buy:", buy, "sell:", sell);
      }
    }
  }
});


    const payload = {
      ok: true,
      source: "BROU",
      fetched_at: new Date().toISOString(),
      name: "Dólar eBROU",
      currency: "USD",
      buy,
      sell,
      media: (buy !== null && sell !== null) ? (buy + sell) / 2 : null,
      cached: false
    };

    CACHE = { ts: now, payload };
    return payload;
  } catch (err) {
    console.error("BROU scrape error:", err.message || err);
    throw err;
  }
};
// Fin de scrapers/brou.js