// scrapers/_utils.js
const pLimit = require('p-limit');

const memoryCache = new Map(); // key -> { data, ts }
const limit = pLimit(5);       // hasta 5 scrapers a la vez

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function withTimeout(promise, ms, name='task'){
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`[${name}] timeout ${ms}ms`)), ms); });
  try { return await Promise.race([promise, timeout]); }
  finally { clearTimeout(t); }
}

async function withRetries(fn, { retries=2, baseDelay=400, name='scraper' } = {}){
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i < retries) await sleep(baseDelay * (i + 1));
    }
  }
  throw lastErr;
}

/**
 * Política real-time con fallback de hasta 3 minutos:
 * - Siempre intenta fresh (con timeout + retries + limit).
 * - Si fresh falla, devuelve cache solo si age <= staleMaxAgeMs (marca stale:true).
 * - Si age > staleMaxAgeMs, propaga error.
 * Nota: cacheTtlMs se mantiene como opción, pero aquí no se usa para “servir fresco desde cache”;
 *       la cache solo se usa como fallback (“stale”).
 */
async function safeScrape(key, scrapeFn, {
  timeoutMs     = 12000,
  retries       = 2,
  cacheTtlMs    = 3 * 60 * 1000, // param mantenido por compatibilidad (no se usa para servir fresh)
  staleMaxAgeMs = 3 * 60 * 1000, // máximo permitido para fallback
} = {}) {
  try {
    const fresh = await limit(() =>
      withTimeout(
        withRetries(() => scrapeFn(), { retries, name: key }),
        timeoutMs,
        key
      )
    );

    // Normalización a número antes de validar
    const buy  = Number(fresh?.buy);
    const sell = Number(fresh?.sell);
    if (!Number.isFinite(buy) || !Number.isFinite(sell)) {
      throw new Error(`[${key}] datos inválidos del scraper (buy/sell no numéricos)`);
    }

    const normalized = { ...fresh, buy, sell };
    memoryCache.set(key, { data: normalized, ts: Date.now() });
    return { ...normalized, stale: false };
  } catch (err) {
    const cached = memoryCache.get(key);
    if (cached) {
      const age = Date.now() - cached.ts;
      if (age <= staleMaxAgeMs) {
        return {
          ...cached.data,
          stale: true,
          stale_age_ms: age,
          note: `[${key}] fallback cache <= ${Math.round(staleMaxAgeMs/1000)}s`,
          error: String(err?.message || err)
        };
      }
    }
    throw err; // sin cache utilizable → error
  }
}

// Utils opcionales para admin/debug
function clearCache() {
  memoryCache.clear();
}
function getCacheStats() {
  const now = Date.now();
  const entries = [];
  for (const [k, v] of memoryCache.entries()) {
    entries.push({ key: k, age_ms: now - v.ts, data: v.data });
  }
  return { size: memoryCache.size, entries };
}

module.exports = { safeScrape, clearCache, getCacheStats };
