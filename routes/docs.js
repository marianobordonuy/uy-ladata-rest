const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const endpoints = [
    {
      path: "/api/currency/all",
      method: "GET",
      description: "Lista todos los scrapers disponibles agrupados por bancos y casas de cambio.",
      example_response: {
        banks: [{ name: "Itau", endpoint: "/api/currency/itau" }],
        exchanges: [{ name: "Alter", endpoint: "/api/currency/alter" }]
      }
    },
    {
      path: "/api/currency/live",
      method: "GET",
      description: "Ejecuta todos los scrapers disponibles y devuelve cotizaciones en tiempo real.",
      example_response: [
        {
          source: "Itau",
          currency: "USD",
          buy: 39.5,
          sell: 41.0,
          media: 40.25,
          timestamp: "2025-06-04T15:00:00Z"
        }
      ]
    },
    {
      path: "/api/currency/itau",
      method: "GET",
      description: "Devuelve la cotización de USD del banco Itau.",
      example_response: {
        source: "Itau",
        currency: "USD",
        buy: 39.5,
        sell: 41.0,
        media: 40.25,
        timestamp: "2025-06-04T15:00:00Z"
      }
    },
    {
      path: "/api/convert",
      method: "GET",
      description: "Convierte un monto entre USD y UYU. Parámetros: amount, from, to, source",
      example: "/api/convert?amount=100&from=USD&to=UYU&source=itau",
      example_response: {
        amount: 100,
        from: "USD",
        to: "UYU",
        rate: 41.0,
        converted: 4100,
        source: "Itau",
        timestamp: "2025-06-04T15:00:00Z"
      }
    },
    {
      path: "/api/docs",
      method: "GET",
      description: "Devuelve esta documentación.",
      example_response: "{ endpoints: [...] }"
    }
  ];

  // HTML version:
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Documentación de API</title>
      <style>
        body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: auto; }
        code { background: #f2f2f2; padding: 2px 4px; border-radius: 4px; }
        pre { background: #f8f8f8; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
        h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      </style>
    </head>
    <body>
      <h1>Documentación de la API</h1>
      ${endpoints.map(ep => `
        <div>
          <h2>${ep.method} <code>${ep.path}</code></h2>
          <p>${ep.description}</p>
          ${ep.example ? `<p><strong>Ejemplo:</strong> <code>${ep.example}</code></p>` : ''}
          <p><strong>Ejemplo de respuesta:</strong></p>
          <pre>${JSON.stringify(ep.example_response, null, 2)}</pre>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
