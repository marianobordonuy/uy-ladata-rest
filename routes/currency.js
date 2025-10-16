const express = require('express');
const router = express.Router();

// Bancos
const scrapeBandes = require('../scrapers/bandes');
const scrapeItau = require('../scrapers/itau');
const scrapeBrou = require('../scrapers/brou');

// Cambios
const scrapeAeromar = require('../scrapers/aeromar');
const scrapeAlter = require('../scrapers/alter');
const scrapeAspen = require('../scrapers/aspen');
const scrapeBacacay = require('../scrapers/bacacay');
const scrapeBrimar = require('../scrapers/brimar');
const scrapeCambilex = require('../scrapers/cambilex');
//const scrapeCambio18 = require('../scrapers/cambio18');
const scrapeDelta = require('../scrapers/delta');
const scrapeGales = require('../scrapers/gales');
const scrapeIberia = require('../scrapers/iberia');
const scrapeMaiorano = require('../scrapers/maiorano');
//const scrapeNixus = require('../scrapers/nixus');
const scrapeVal = require('../scrapers/val');
const scrapeVarlix = require('../scrapers/varlix');
const scrapeBacacaySF = require('../scrapers/bacacay');
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

router.get('/brou', async (req, res) => {
    try {
        const data = await scrapeBrou();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Brou' });
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

router.get('/bacacay', async (req, res) => {
    try {
        const data = await scrapeBacacay();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Bacacay' });
    }
});

router.get('/brimar', async (req, res) => {
    try {
        const data = await scrapeBrimar();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Brimar' });
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

router.get('/cambio18', async (req, res) => {
    try {
        const data = await scrapeCambio18();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Cambio 18' });
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

router.get('/nixus', async (req, res) => {
    try {
        const data = await scrapeNixus();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error en Nixus' });
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
        { name: 'Itau', endpoint: '/api/currency/itau' },
        { name: 'Brou', endpoint: '/api/currency/brou' }
        // Podés agregar más bancos si implementás BROU, BBVA, etc.
    ];

    const exchanges = [
        { name: 'Aeromar', endpoint: '/api/currency/aeromar' },
        { name: 'Alter', endpoint: '/api/currency/alter' },
        { name: 'Aspen', endpoint: '/api/currency/aspen' },
        { name: 'Bacacay', endpoint: '/api/currency/bacacay' },
        { name: 'Brimar', endpoint: '/api/currency/brimar' },
        { name: 'Cambilex', endpoint: '/api/currency/cambilex' },
        //{ name: 'Cambio 18', endpoint: '/api/currency/cambio18' },
        { name: 'Delta', endpoint: '/api/currency/delta' },
        { name: 'Gales', endpoint: '/api/currency/gales' },
        { name: 'Iberia', endpoint: '/api/currency/iberia' },
        { name: 'Maiorano', endpoint: '/api/currency/maiorano' },
        //{ name: 'nixus', endpoint: '/api/currency/nixus' },
        { name: 'Val', endpoint: '/api/currency/val' },
        { ame: 'Varlix', endpoint: '/api/currency/varlix' }
    ];

    res.json({ banks, exchanges });
});

router.get('/live', async (req, res) => {
    try {
      const results = await Promise.allSettled([
        scrapeBandes(), scrapeItau(), scrapeBrou(), scrapeAeromar(), scrapeAspen(), scrapeBrimar(),
        scrapeCambilex(), scrapeDelta(), scrapeGales(), scrapeIberia(), scrapeVal(), scrapeVarlix()
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
