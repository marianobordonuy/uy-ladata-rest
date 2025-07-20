const fs = require('fs');
const path = require('path');

const apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/apikeys.json')));
const usage = {}; // { key: { count: 0, lastReset: "YYYY-MM-DD" } }

function apiKeyMiddleware(req, res, next) {
  const key = req.query.apikey;
  const today = new Date().toISOString().slice(0, 10);

  if (!key || !apiKeys[key]) {
    return res.status(401).json({ error: 'API key inválida o faltante' });
  }

  if (!usage[key] || usage[key].lastReset !== today) {
    usage[key] = { count: 0, lastReset: today };
  }

  const plan = apiKeys[key];
  if (usage[key].count >= plan.limit) {
    return res.status(429).json({ error: 'Límite diario alcanzado para tu plan' });
  }

  usage[key].count++;
  req.apikey = key;
  req.plan = plan.plan;
  next();
}

module.exports = apiKeyMiddleware;