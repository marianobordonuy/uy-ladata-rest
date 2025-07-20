const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const fuelPath = path.join(__dirname, '../data/fuel.json');

// GET /api/fuel → Devuelve todos los precios
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(fuelPath));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'No se pudo leer el archivo de combustibles' });
  }
});

// PUT /api/fuel/:key → Actualiza solo un combustible
router.put('/:key', express.json(), (req, res) => {
  const apikey = req.query.apikey;
  if (apikey !== 'admin123') {
    return res.status(401).json({ error: 'API key inválida o sin permisos' });
  }

  const fuelKey = req.params.key;
  const { price, last_updated } = req.body;

  if (!price || typeof price !== 'number') {
    return res.status(400).json({ error: 'Se requiere un valor numérico en "price"' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(fuelPath));

    if (!data[fuelKey]) {
      return res.status(404).json({ error: `No se encontró el combustible "${fuelKey}"` });
    }

    // Actualizar precio por litro
    data[fuelKey].prices.L.price = parseFloat(price.toFixed(2));
    // Convertir a galón
    data[fuelKey].prices.gal.price = parseFloat((price * 3.78541).toFixed(2));
    // Actualizar fecha si se proporcionó
    if (last_updated) {
      data[fuelKey].last_updated = last_updated;
    }

    fs.writeFileSync(fuelPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      updated: {
        key: fuelKey,
        price_L: data[fuelKey].prices.L.price,
        price_gal: data[fuelKey].prices.gal.price,
        last_updated: data[fuelKey].last_updated
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el archivo de combustibles' });
  }
});

module.exports = router;