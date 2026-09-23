// Log every new pump.fun coin as it launches, then how many distinct wallets bought it in its first 10 seconds.
//   npm i ws && node new-coins.mjs YOUR_KEY
import WebSocket from 'ws';

const KEY = process.argv[2];
if (!KEY) { console.error('usage: node new-coins.mjs YOUR_KEY'); process.exit(1); }

const coins = new Map(); // mint -> { name, symbol, t, buyers: Set }
const ws = new WebSocket(`wss://178-105-104-17.sslip.io/stream?key=${KEY}`);
ws.on('open', () => ws.send(JSON.stringify({ types: ['create', 'buy'] })));
ws.on('message', (m) => {
  const msg = JSON.parse(m.toString());
  for (const e of msg.events) {
    if (e.type === 'create') {
      coins.set(e.mint, { name: e.name, symbol: e.symbol, t: msg.t, buyers: new Set() });
      console.log(`${new Date(msg.t).toISOString()}  NEW  ${e.symbol.padEnd(10)} ${e.name.slice(0, 30).padEnd(30)} ${e.mint}${e.mayhem ? '  (mayhem)' : ''}`);
      setTimeout(() => {
        const c = coins.get(e.mint);
        console.log(`   ${e.symbol}: ${c.buyers.size} distinct buyers in the first 10 s`);
        coins.delete(e.mint);
      }, 10_000);
    } else if (e.type === 'buy') {
      const c = coins.get(e.mint);
      if (c && msg.t - c.t <= 10_000) c.buyers.add(e.user);
    }
  }
});
ws.on('close', (code) => console.log('closed', code));
