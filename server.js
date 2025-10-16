const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000; // coincide con tu fly.toml

const DATA_DIR = path.join(__dirname, 'data');
const RESERVAS_FILE = path.join(DATA_DIR, 'reservas.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RESERVAS_FILE)) fs.writeFileSync(RESERVAS_FILE, '[]');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

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

// 🎯 Crear una reserva
// body: { code, sourceName, buy, sell, usdAmount, uyus, feeUsd, lockedAt, expiresAt }
app.post('/app/reservas', (req, res) => {
  const r = req.body || {};
  if (!r.code || !r.sourceName || !r.buy || !r.usdAmount || !r.expiresAt) {
    return res.status(400).json({ error: 'Datos insuficientes' });
  }
  const all = readJSON();
  // evitar duplicados por code
  const exists = all.find(x => x.code === r.code);
  if (exists) return res.status(409).json({ error: 'Código ya existe' });
  r.status = 'pending'; // pending | validated | expired | cancelled
  all.push(r);
  writeJSON(all);
  res.json(r);
});

// 🔎 Obtener una reserva por código
app.get('/app/reservas/:code', (req, res) => {
  const { code } = req.params;
  const all = readJSON();
  const r = all.find(x => x.code === code);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  // Autocaducar si pasó expiry
  const now = Date.now();
  if (new Date(r.expiresAt).getTime() < now && r.status === 'pending') {
    r.status = 'expired';
    writeJSON(all);
  }
  res.json(r);
});

// ✅ Validar (marcar como realizada) por el local
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

// 🤏 Opcional: cancelar
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

// Ping simple
app.get('/app/ping', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});