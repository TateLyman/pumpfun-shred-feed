# Print every pump.fun launch and trade from the shred feed.
#   pip install websockets && python stream.py YOUR_KEY
import asyncio
import json
import sys

import websockets


async def main(key: str) -> None:
    async with websockets.connect(f"wss://178-105-104-17.sslip.io/stream?key={key}") as ws:
        await ws.send(json.dumps({"types": ["create", "buy", "sell", "migrate"]}))
        async for raw in ws:
            msg = json.loads(raw)
            for e in msg["events"]:
                if e["type"] == "create":
                    print(f"NEW   {e['symbol']:<10} {e['name'][:30]:<30} {e['mint']}")
                else:
                    print(f"{e['type'].upper():<5} {e['mint']}  {e.get('user', '')}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("usage: python stream.py YOUR_KEY")
    asyncio.run(main(sys.argv[1]))
