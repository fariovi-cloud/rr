export type Level = [number, number]; // [price, amount]
export type OrderBook = { bids: Level[]; asks: Level[]; symbol?: string };

export function midFromBook(book: OrderBook) {
  const bestBid = book.bids[0]?.[0];
  const bestAsk = book.asks[0]?.[0];
  if (bestBid == null || bestAsk == null) return null;
  return (bestBid + bestAsk) / 2;
}

export function liquidityBandsUSD(book: OrderBook, bands = [1, 2, 5, 10]) {
  const mid = midFromBook(book);
  if (!mid) {
    return bands.map((b) => ({ band: b, bid_usd: 0, ask_usd: 0, total_usd: 0 }));
  }

  const res: { band: number; bid_usd: number; ask_usd: number; total_usd: number }[] = [];
  for (const band of bands) {
    const up = mid * (1 + band / 100);
    const dn = mid * (1 - band / 100);

    let askUsd = 0;
    for (const [p, a] of book.asks) {
      if (p > up) break;
      askUsd += p * a;
    }

    let bidUsd = 0;
    for (const [p, a] of book.bids) {
      if (p < dn) break;
      bidUsd += p * a;
    }

    res.push({ band, bid_usd: bidUsd, ask_usd: askUsd, total_usd: bidUsd + askUsd });
  }
  return res;
}

/* ===================== Биржи: публичные стаканы ===================== */

export async function gateBook(): Promise<OrderBook | null> {
  const pairs = ["RARI_USDT", "RARI_USD"];
  for (const pair of pairs) {
    const u = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair}&limit=200`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;

    const asks: Level[] = (j.asks as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => a[0] - b[0]);

    const bids: Level[] = (j.bids as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => b[0] - a[0]);

    return { asks, bids, symbol: pair };
  }
  return null;
}

export async function mexcBook(): Promise<OrderBook | null> {
  const pairs = ["RARIUSDT", "RARIUSD"];
  for (const s of pairs) {
    const u = `https://api.mexc.com/api/v3/depth?symbol=${s}&limit=200`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;

    const asks: Level[] = (j.asks as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => a[0] - b[0]);

    const bids: Level[] = (j.bids as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => b[0] - a[0]);

    return { asks, bids, symbol: s };
  }
  return null;
}

export async function coinbaseBook(): Promise<OrderBook | null> {
  const pairs = ["RARI-USD", "RARI-USDT"];
  for (const s of pairs) {
    const u = `https://api.exchange.coinbase.com/products/${s}/book?level=2`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;

    const asks: Level[] = (j.asks as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => a[0] - b[0]);

    const bids: Level[] = (j.bids as [string, string][])
      .map(([p, a]) => [parseFloat(p), parseFloat(a)] as Level)
      .sort((a: Level, b: Level) => b[0] - a[0]);

    return { asks, bids, symbol: s };
  }
  return null;
}

export async function krakenBook(): Promise<OrderBook | null> {
  const pairs = ["RARIUSD", "RARIUSDT"];
  for (const p of pairs) {
    const u = `https://api.kraken.com/0/public/Depth?pair=${p}&count=200`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    if (j.error?.length) continue;
    const key = Object.keys(j.result || {})[0];
    if (!key) continue;
    const ob = j.result[key];

    const asks: Level[] = (ob.asks as [string, string][])
      .map(([px, am]) => [parseFloat(px), parseFloat(am)] as Level)
      .sort((a: Level, b: Level) => a[0] - b[0]);

    const bids: Level[] = (ob.bids as [string, string][])
      .map(([px, am]) => [parseFloat(px), parseFloat(am)] as Level)
      .sort((a: Level, b: Level) => b[0] - a[0]);

    return { asks, bids, symbol: key };
  }
  return null;
}

export async function cryptoComBook(): Promise<OrderBook | null> {
  const pairs = ["RARI_USD", "RARI_USDT"];
  for (const p of pairs) {
    try {
      const tUrl = `https://api.crypto.com/v2/public/get-ticker?instrument_name=${p}`;
      const tRes = await fetch(tUrl, { cache: "no-store" });
      if (!tRes.ok) continue;
      const tJson = await tRes.json();
      const tData = tJson?.result?.data?.[0];
      if (!tData) continue;
    } catch {
      continue;
    }

    const u = `https://api.crypto.com/v2/public/get-book?instrument_name=${p}&depth=50`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    const data = j?.result?.data?.[0];
    if (!data?.bids || !data?.asks) continue;

    const asks: Level[] = (data.asks as [string, string][])
      .map(([px, am]) => [parseFloat(px), parseFloat(am)] as Level)
      .sort((a: Level, b: Level) => a[0] - b[0]);

    const bids: Level[] = (data.bids as [string, string][])
      .map(([px, am]) => [parseFloat(px), parseFloat(am)] as Level)
      .sort((a: Level, b: Level) => b[0] - a[0]);

    return { asks, bids, symbol: p };
  }
  return null;
}
