const express = require('express');
const router = express.Router();

// Bancos
const scrapeBandes = require('../scrapers/bandes');
const scrapeItau = require('../scrapers/itau');

// Cambios
const scrapeAeromar = require('../scrapers/aeromar');
const scrapeAlter = require('../scrapers/alter');
const scrapeAspen = require('../scrapers/aspen');
const scrapeCambilex = require('../scrapers/cambilex');
const scrapeDelta = require('../scrapers/delta');
const scrapeGales = require('../scrapers/gales');
const scrapeIberia = require('../scrapers/iberia');
const scrapeMaiorano = require('../scrapers/maiorano');
const scrapeVal = require('../scrapers/val');
const scrapeVarlix = require('../scrapers/varlix');
// Opcional: otros que tenías comentados o en lista

// 📌 Endpoints individuales
router.get('/bandes', async (req, res) => {
    try {
        const data = await scrapeBandes();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Bandes' });
    }
});

router.get('/itau', async (req, res) => {
    try {
        const data = await scrapeItau();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Itau' });
    }
});

router.get('/aeromar', async (req, res) => {
    try {
        const data = await scrapeAeromar();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Aeromar' });
    }
});

router.get('/alter', async (req, res) => {
    try {
        const data = await scrapeAlter();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Alter' });
    }
});

router.get('/aspen', async (req, res) => {
    try {
        const data = await scrapeAspen();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Aspen' });
    }
});

router.get('/cambilex', async (req, res) => {
    try {
        const data = await scrapeCambilex();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Cambilex' });
    }
});

router.get('/delta', async (req, res) => {
    try {
        const data = await scrapeDelta();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Delta' });
    }
});

router.get('/gales', async (req, res) => {
    try {
        const data = await scrapeGales();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Gales' });
    }
});

router.get('/iberia', async (req, res) => {
    try {
        const data = await scrapeIberia();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Iberia' });
    }
});

router.get('/maiorano', async (req, res) => {
    try {
        const data = await scrapeMaiorano();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Maiorano' });
    }
});

router.get('/val', async (req, res) => {
    try {
        const data = await scrapeVal();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Val' });
    }
});

router.get('/varlix', async (req, res) => {
    try {
        const data = await scrapeVarlix();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Varlix' });
    }
});

// 📦 Endpoint de listado: /api/currency/all
router.get('/all', (req, res) => {
    const banks = [
        { name: 'Bandes', endpoint: '/api/currency/bandes' },
        { name: 'Itau', endpoint: '/api/currency/itau' }
        // Podés agregar más bancos si implementás BROU, BBVA, etc.
    ];

    const exchanges = [
        { name: 'Aeromar', endpoint: '/api/currency/aeromar' },
        { name: 'Alter', endpoint: '/api/currency/alter' },
        { name: 'Aspen', endpoint: '/api/currency/aspen' },
        { name: 'Cambilex', endpoint: '/api/currency/cambilex' },
        { name: 'Delta', endpoint: '/api/currency/delta' },
        { name: 'Gales', endpoint: '/api/currency/gales' },
        { name: 'Iberia', endpoint: '/api/currency/iberia' },
        { name: 'Maiorano', endpoint: '/api/currency/maiorano' },
        { name: 'Val', endpoint: '/api/currency/val' },
        { name: 'Varlix', endpoint: '/api/currency/varlix' }
    ];

    res.json({ banks, exchanges });
});

router.get('/live', async (req, res) => {
    try {
      const results = await Promise.allSettled([
        scrapeBandes(), scrapeItau(), scrapeAeromar(), scrapeAlter(), scrapeAspen(),
        scrapeCambilex(), scrapeDelta(), scrapeGales(), scrapeIberia(),
        scrapeMaiorano(), scrapeVal(), scrapeVarlix()
      ]);
  
      const data = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
  
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener datos en vivo' });
    }
  });

module.exports = router;
