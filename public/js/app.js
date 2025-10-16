(function(){
const UYU = {};


UYU._cachedSources = [];


UYU.generateCode = function (len = 6) {
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I,O,1,0
let s = '';
for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
return s;
};


UYU.fetchWithTimeout = function(url, ms = 25000){
const ctrl = new AbortController();
const t = setTimeout(() => { try { ctrl.abort('timeout'); } catch(_){} }, ms);
return fetch(url, { signal: ctrl.signal, cache: 'no-store' })
.then(r => { clearTimeout(t); return r; })
.catch(e => { clearTimeout(t); throw e; });
};


UYU.loadQuotes = async function(API_BASE, apikey){
let list = [];
let last = '';
try {
const res = await UYU.fetchWithTimeout(`${API_BASE}/currency/live?apikey=${apikey}`, 25000);
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();
list = (Array.isArray(data) ? data : []).map(x => ({
name: x.name || x.source || 'Fuente',
buy: Number(x.buy),
sell: Number(x.sell)
})).filter(x => !Number.isNaN(x.buy) && !Number.isNaN(x.sell));
last = new Date().toLocaleString('es-UY');
} catch (e) {
// Fallback mock básico
list = [
{ name: 'Itaú', buy: 51.20, sell: 53.50 },
{ name: 'BROU', buy: 50.90, sell: 53.10 },
{ name: 'Gales', buy: 51.00, sell: 53.30 },
{ name: 'Cambilex', buy: 51.35, sell: 53.40 },
];
last = 'Sin conexión (referencia)';
}
UYU._cachedSources = list;
return { list, last };
};


window.UYU = UYU;
})();