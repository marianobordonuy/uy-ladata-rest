const express = require('express');
const cors = require('cors');
const path = require('path');
const currencyRoutes = require('./routes/currency');
const convertRoutes = require('./routes/convert');
const docsRoutes = require('./routes/docs');
const ratesFuels = require('./routes/fuel');
const apiKeyMiddleware = require('./middlewares/apikey');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/api/currency', currencyRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/fuel', ratesFuels);
app.use('/api', apiKeyMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('API de Cotizaciones de Moneda');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
