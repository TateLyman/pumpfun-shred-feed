# pump.fun at shred speed

A WebSocket feed of every **pump.fun launch and bonding-curve trade**, decoded from Solana **shreds**: the moment the
leader broadcasts the transaction, before the block is confirmed. Clean JSON, one connection, paid in SOL.

**Live:** https://178-105-104-17.sslip.io/ (the page shows a live latency race against PumpPortal's free feed)

| | |
|---|---|
| Median lead over PumpPortal's free websocket on new coins | ~140-160 ms, measured from our server in Germany (live on the page) |
| New pump.fun coins announced first | 100% of the coins both feeds saw in our measurements |
| Server location | Germany (Frankfurt region). Best for bots hosted in Europe |
| Price | 0.4 SOL / 30 days, up to 2 connections per key |
| Trial | free, 1 hour, from the page |

Where the lead comes from, honestly: we decode shreds, so we see a transaction as the leader broadcasts it; PumpPortal
serves from New York, so part of the lead measured from Germany is distance. From US East the gap is smaller. Run
[`examples/race.mjs`](examples/race.mjs) from your own server and judge for yourself.

Since Jito ShredStream shut down (5 Sep 2026), shred-level data costs $200-1,500/month from the big providers. This is
the part most pump.fun bots actually need, decoded, for a fraction of that.

## Quickstart

Get a trial key on the page (one click), then:

```js
// Node 18+  (npm i ws)
import WebSocket from 'ws';
const ws = new WebSocket('wss://178-105-104-17.sslip.io/stream?key=YOUR_KEY');
ws.on('open', () => ws.send(JSON.stringify({ types: ['create'] })));   // optional filter
ws.on('message', (m) => console.log(JSON.parse(m.toString())));
```

```python
# Python 3.9+  (pip install websockets)
import asyncio, json, websockets
async def main():
    async with websockets.connect("wss://178-105-104-17.sslip.io/stream?key=YOUR_KEY") as ws:
        await ws.send(json.dumps({"types": ["create", "buy"]}))
        async for m in ws:
            print(json.loads(m))
asyncio.run(main())
```

More in [`examples/`](examples): a new-coin logger with first-buyer tracking, and a latency comparison you can run
against any other feed yourself.

## Messages

One message per transaction:

```json
{
  "slot": 449804109,
  "idx": 608,
  "sig": "2ysEMhfA8uDaJwvsPqjEqhJF...",
  "signer": "BZBg342rjdvrGoCymFRE...",
  "t": 1790193293099,
  "events": [
    { "type": "create", "mint": "2H3KryHb6oKkGPcMJjR6XVw4yUW9oskZRj9JrRSvpump", "name": "Trace", "symbol": "TRACE",
      "uri": "https://ipfs.io/ipfs/...", "creator": "BZBg342rjdvrGoCymFRE...", "tokenProgram": "TokenzQd...", "mayhem": false },
    { "type": "buy", "mint": "2H3Kry...pump", "user": "BZBg342r...", "quote": "So111...", "tokens": 100000000000000, "maxQuote": 3153006168 }
  ]
}
```

| field | meaning |
|---|---|
| `slot` | the slot the leader produced it in |
| `idx` | position of its entry batch in the slot (shred index): a proxy for block order |
| `t` | ms since epoch when our receiver decoded it |
| `signer` | fee payer |

| event | fields |
|---|---|
| `create` | mint, name, symbol, uri, creator, tokenProgram, mayhem |
| `buy` | mint, user, quote, and the instruction's amounts: `tokens` + `maxQuote`, or `quoteIn` + `minTokens` |
| `sell` | mint, user, quote, tokens, minQuote |
| `migrate` | mint |

Amounts are raw units (lamports; tokens with 6 decimals). Filter after connecting by sending
`{"types": [...], "mints": [...]}` (both optional; up to 1,000 mints).

## Honest limits

- Shreds carry transactions **as the leader puts them in the block, before execution results**. A transaction you see
  may still fail, and trade amounts are the instruction's limits, not the executed fill. That is the price of seeing it
  first; confirm on-chain where it matters.
- Coverage is what our receiver decodes; a rare lost shred batch means a missed message.
- pump.fun bonding curve only (plus migrations). No PumpSwap pool trades, no mayhem-agent trades.
- Best effort, no uptime guarantee, no trading advice. Use the free trial before buying; keys are not refunded.

## Buying

On the page: **Buy a key** shows a unique SOL amount (e.g. `0.400123`) and the address. Send exactly that amount in one
transfer within 2 hours; the key appears on the page within about a minute. Renewals extend the same key.

## License

The examples in this repository are MIT licensed. The feed itself is a paid service.
