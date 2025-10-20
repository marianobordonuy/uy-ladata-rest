const express = require('express');
//const scrapeCambio18 = require('../scrapers/cambio18');
const router = express.Router();

const sources = {
  bandes: require('../scrapers/bandes'),
  itau: require('../scrapers/itau'),
  aeromar: require('../scrapers/aeromar'),
  aspen: require('../scrapers/aspen'),
  avenida: require('../scrapers/avenida'),
  cambilex: require('../scrapers/cambilex'),
  cambio18: require('../scrapers/cambio18'),
  delta: require('../scrapers/delta'),
  eurodracma: require('../scrapers/eurodracma'),
  gales: require('../scrapers/gales'),
  iberia: require('../scrapers/iberia'),
  val: require('../scrapers/val'),
  varlix: require('../scrapers/varlix')
};

router.get('/', async (req, res) => {
  const { amount, from = 'USD', to = 'UYU', source = 'itau' } = req.query;

  const numericAmount = parseFloat(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  const scraper = sources[source.toLowerCase()];
  if (!scraper) {
    return res.status(400).json({ error: 'Fuente no soportada' });
  }

  try {
    const data = await scraper();

    // Conversión: USD→UYU si `from=USD` y `to=UYU`
    let rate;
    if (from === 'USD' && to === 'UYU') {
      rate = data.sell;
    } else if (from === 'UYU' && to === 'USD') {
      rate = 1 / data.buy;
    } else {
      return res.status(400).json({ error: 'Solo se soporta conversión entre USD y UYU' });
    }

    const converted = numericAmount * rate;

    res.json({
      amount: numericAmount,
      from,
      to,
      rate: parseFloat(rate.toFixed(4)),
      converted: parseFloat(converted.toFixed(2)),
      source: data.source,
      timestamp: data.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la cotización' });
  }
});

module.exports = router;
