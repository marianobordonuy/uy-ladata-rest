// index.js — servidor unificado (API + Reservas + estáticos)

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Rutas de tu API existente
const currencyRoutes = require('./routes/currency');
const convertRoutes = require('./routes/convert');
const docsRoutes = require('./routes/docs');
const apiKeyMiddleware = require('./middlewares/apikey');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares base ----------
app.use(cors());
app.use(express.json()); // reemplaza body-parser.json()

// ---------- PREFIJO /api PROTEGIDO POR APIKEY ----------
/**
 * IMPORTANTE: El middleware de API Key va ANTES de montar las rutas en /api/*
 * para que todas queden protegidas. Si querés que alguna no exija apikey,
 * montala fuera del prefijo /api o mové este middleware debajo.
 */
app.use('/api', apiKeyMiddleware);

// ---------- Rutas de la API de cotizaciones ----------
app.use('/api/currency', currencyRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/docs', docsRoutes);

// ---------- Estáticos ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Mini-backend de reservas (persistencia en JSON) ----------
const DATA_DIR = path.join(__dirname, 'data');
const RESERVAS_FILE = path.join(DATA_DIR, 'reservas.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RESERVAS_FILE)) fs.writeFileSync(RESERVAS_FILE, '[]');

function readJSON() {
  try {
    const raw = fs.readFileSync(RESERVAS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error leyendo reservas.json', e);
    return [];
  }
}
function writeJSON(data) {
  fs.writeFileSync(RESERVAS_FILE, JSON.stringify(data, null, 2));
}

// Crear una reserva
// body: { code, sourceName, buy, sell, usdAmount, uyus, feeUsd, lockedAt, expiresAt }
app.post('/app/reservas', (req, res) => {
  const r = req.body || {};
  if (!r.code || !r.sourceName || !r.buy || !r.usdAmount || !r.expiresAt) {
    return res.status(400).json({ error: 'Datos insuficientes' });
  }
  const all = readJSON();
  const exists = all.find(x => x.code === r.code);
  if (exists) return res.status(409).json({ error: 'Código ya existe' });
  r.status = 'pending'; // pending | validated | expired | cancelled
  all.push(r);
  writeJSON(all);
  res.json(r);
});

// Obtener una reserva por código
app.get('/app/reservas/:code', (req, res) => {
  const { code } = req.params;
  const all = readJSON();
  const r = all.find(x => x.code === code);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  const now = Date.now();
  if (new Date(r.expiresAt).getTime() < now && r.status === 'pending') {
    r.status = 'expired';
    writeJSON(all);
  }
  res.json(r);
});

// Validar una reserva
app.post('/app/reservas/:code/validate', (req, res) => {
  const { code } = req.params;
  const all = readJSON();
  const r = all.find(x => x.code === code);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  if (r.status !== 'pending') return res.status(409).json({ error: `No se puede validar: estado ${r.status}` });
  r.status = 'validated';
  r.validatedAt = new Date().toISOString();
  writeJSON(all);
  res.json(r);
});

// Cancelar una reserva
app.post('/app/reservas/:code/cancel', (req, res) => {
  const { code } = req.params;
  const all = readJSON();
  const r = all.find(x => x.code === code);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  if (r.status !== 'pending') return res.status(409).json({ error: `No se puede cancelar: estado ${r.status}` });
  r.status = 'cancelled';
  r.cancelledAt = new Date().toISOString();
  writeJSON(all);
  res.json(r);
});

// Ping simple para diagnóstico del mini-backend
app.get('/app/ping', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---------- Raíz ----------
app.get('/', (_req, res) => {
  res.send('API de Cotizaciones de Moneda — y backend de reservas activo');
});

// ---------- Manejo de errores básico ----------
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno' });
});


// 🔹 NUEVO: reservas (sin prefijo extra porque ya usan /app/reservas)
app.use(require('./routes/reservas'));

const reservasRouter = require('./routes/reservas');
app.use('/app/reservas', reservasRouter);

// ---------- Arranque ----------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// ---------- Fin de index.js ----------