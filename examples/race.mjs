// Check the latency claim yourself: for every new pump.fun coin, the time this feed announces its create vs the time
// PumpPortal's free websocket announces it. Prints the lead distribution after N seconds.
//   npm i ws && node race.mjs YOUR_KEY [seconds]
import WebSocket from 'ws';

const KEY = process.argv[2];
const SECONDS = Number(process.argv[3] ?? 300);
if (!KEY) { console.error('usage: node race.mjs YOUR_KEY [seconds]'); process.exit(1); }

const ours = new Map();
const theirs = new Map();

const feed = new WebSocket(`wss://178-105-104-17.sslip.io/stream?key=${KEY}`);
feed.on('open', () => feed.send(JSON.stringify({ types: ['create'] })));
feed.on('message', (m) => {
  const now = Date.now();
  for (const e of JSON.parse(m.toString()).events) if (e.type === 'create' && !ours.has(e.mint)) ours.set(e.mint, now);
});

const pp = new WebSocket('wss://pumpportal.fun/api/data');
pp.on('open', () => pp.send(JSON.stringify({ method: 'subscribeNewToken' })));
pp.on('message', (m) => {
  const e = JSON.parse(m.toString());
  if (e.mint && !theirs.has(e.mint)) theirs.set(e.mint, Date.now());
});

setTimeout(() => {
  const leads = [...theirs].filter(([m]) => ours.has(m)).map(([m, t]) => t - ours.get(m)).sort((a, b) => a - b);
  const q = (f) => leads[Math.min(leads.length - 1, Math.floor(leads.length * f))];
  console.log(`coins seen by both: ${leads.length}; this feed first on ${leads.filter((x) => x > 0).length}`);
  if (leads.length) console.log(`lead in ms: p10 ${q(0.1)}  p50 ${q(0.5)}  p90 ${q(0.9)}`);
  process.exit(0);
}, SECONDS * 1000);
