// routes/reservas.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const STORE_PATH = path.join(process.cwd(), 'data', 'reservas.json');

function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, '[]', 'utf8');
}
function readStore() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8') || '[]'); }
  catch { return []; }
}
function writeStore(list) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), 'utf8');
}

function normalizeReserva(payload) {
  const now = new Date().toISOString();
  return {
    code: String(payload.code || '').trim().toUpperCase(),
    sourceName: payload.sourceName || 'Fuente',
    buy: Number(payload.buy) || 0,
    sell: Number(payload.sell) || 0,
    usdAmount: Number(payload.usdAmount) || 0,
    uyus: Number(payload.uyus) || 0,
    feeUsd: Number(payload.feeUsd) || 0,
    lockedAt: payload.lockedAt || now,
    expiresAt: payload.expiresAt || now,
    status: payload.status || 'pending', // pending | validated | cancelled | expired
    validatedAt: payload.validatedAt || null,
    validatedBy: payload.validatedBy || null,
    validatedBranch: payload.validatedBranch || null,
    note: payload.note || null,
    createdAt: now,
    updatedAt: now
  };
}

// Crear
router.post('/app/reservas', (req, res) => {
  try {
    const list = readStore();
    const r = normalizeReserva(req.body || {});
    if (!r.code) return res.status(400).json({ error: 'code requerido' });
    if (list.find(x => x.code === r.code)) {
      return res.status(409).json({ error: 'code ya existe' });
    }
    list.push(r);
    writeStore(list);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: 'no se pudo crear' });
  }
});

// Listar (status=all|pending|validated|cancelled|expired, q=texto)
router.get('/app/reservas', (req, res) => {
  const { status = 'all', q } = req.query;
  let list = readStore();

  // Auto-expirar pendientes vencidas (best-effort)
  const now = Date.now();
  let changed = false;
  list = list.map(r => {
    if (r.status === 'pending' && r.expiresAt && Date.parse(r.expiresAt) < now) {
      changed = true;
      return { ...r, status: 'expired', updatedAt: new Date().toISOString() };
    }
    return r;
  });
  if (changed) writeStore(list);

  if (status !== 'all') list = list.filter(r => r.status === status);
  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    list = list.filter(r =>
      (r.code || '').toLowerCase().includes(s) ||
      (r.sourceName || '').toLowerCase().includes(s)
    );
  }

  // Orden: pendientes por próximo vencimiento, resto por creación desc
  list.sort((a, b) => {
    const ap = a.status === 'pending', bp = b.status === 'pending';
    if (ap !== bp) return ap ? -1 : 1;
    if (ap && bp) return Date.parse(a.expiresAt||0) - Date.parse(b.expiresAt||0);
    return Date.parse(b.createdAt||0) - Date.parse(a.createdAt||0);
  });

  res.set('Cache-Control','no-store');
  res.json(list);
});

// Obtener una
router.get('/app/reservas/:code', (req, res) => {
  const list = readStore();
  const item = list.find(r => r.code === String(req.params.code).toUpperCase());
  if (!item) return res.status(404).json({ error: 'no encontrada' });
  res.json(item);
});

// Validar
router.patch('/app/reservas/:code/validate', (req, res) => {
  const list = readStore();
  const i = list.findIndex(r => r.code === String(req.params.code).toUpperCase());
  if (i === -1) return res.status(404).json({ error: 'no encontrada' });
  const now = new Date().toISOString();
  const { by, branch, note } = req.body || {};
  list[i] = {
    ...list[i],
    status: 'validated',
    validatedAt: now,
    validatedBy: by || list[i].validatedBy || null,
    validatedBranch: branch || list[i].validatedBranch || null,
    note: note || list[i].note || null,
    updatedAt: now
  };
  writeStore(list);
  res.json(list[i]);
});

// Cancelar
router.patch('/app/reservas/:code/cancel', (req, res) => {
  const list = readStore();
  const i = list.findIndex(r => r.code === String(req.params.code).toUpperCase());
  if (i === -1) return res.status(404).json({ error: 'no encontrada' });
  const now = new Date().toISOString();
  list[i] = { ...list[i], status: 'cancelled', note: (req.body && req.body.note) || list[i].note || null, updatedAt: now };
  writeStore(list);
  res.json(list[i]);
});

module.exports = router;
