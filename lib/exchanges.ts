export type Level = [number, number]; // [price, amount]
export type OrderBook = { bids: Level[]; asks: Level[]; symbol?: string };

export function midFromBook(book: OrderBook) {
  const bestBid = book.bids[0]?.[0];
  const bestAsk = book.asks[0]?.[0];
  if (!bestBid || !bestAsk) return null;
  return (bestBid + bestAsk) / 2;
}

export function liquidityBandsUSD(book: OrderBook, bands = [1,2,5,10]) {
  const mid = midFromBook(book);
  if (!mid) return bands.map(b => ({ band: b, bid_usd: 0, ask_usd: 0, total_usd: 0 }));

  const res = [] as { band: number; bid_usd: number; ask_usd: number; total_usd: number }[];
  for (const band of bands) {
    const up = mid * (1 + band/100);
    const dn = mid * (1 - band/100);

    let askUsd = 0;
    for (const [p,a] of book.asks) {
      if (p > up) break;
      askUsd += p * a;
    }

    let bidUsd = 0;
    for (const [p,a] of book.bids) {
      if (p < dn) break;
      bidUsd += p * a;
    }

    res.push({ band, bid_usd: bidUsd, ask_usd: askUsd, total_usd: bidUsd + askUsd });
  }
  return res;
}

// ==== Биржи ====
export async function gateBook(): Promise<OrderBook | null> {
  const pairs = ["RARI_USDT","RARI_USD"];
  for (const pair of pairs) {
    const u = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair}&limit=200`;
    const r = await fetch(u, { cache: "no-store"});
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;
    return {
      asks: j.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>a[0]-b[0]),
      bids: j.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>b[0]-a[0]),
      symbol: pair
    };
  }
  return null;
}

export async function mexcBook(): Promise<OrderBook | null> {
  const pairs = ["RARIUSDT","RARIUSD"];
  for (const s of pairs) {
    const u = `https://api.mexc.com/api/v3/depth?symbol=${s}&limit=200`;
    const r = await fetch(u, { cache: "no-store"});
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;
    return {
      asks: j.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>a[0]-b[0]),
      bids: j.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>b[0]-a[0]),
      symbol: s
    };
  }
  return null;
}

export async function coinbaseBook(): Promise<OrderBook | null> {
  const pairs = ["RARI-USD","RARI-USDT"];
  for (const s of pairs) {
    const u = `https://api.exchange.coinbase.com/products/${s}/book?level=2`;
    const r = await fetch(u, { cache: "no-store"});
    if (!r.ok) continue;
    const j = await r.json();
    if (!j.asks || !j.bids) continue;
    return {
      asks: j.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>a[0]-b[0]),
      bids: j.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>b[0]-a[0]),
      symbol: s
    };
  }
  return null;
}

export async function krakenBook(): Promise<OrderBook | null> {
  const pairs = ["RARIUSD","RARIUSDT"];
  for (const p of pairs) {
    u = `https://api.kraken.com/0/public/Depth?pair=${p}&count=200`;
    const r = await fetch(u, { cache: "no-store"});
    if (!r.ok) continue;
    const j = await r.json();
    if (j.error?.length) continue;
    const key = Object.keys(j.result || {})[0];
    if (!key) continue;
    const ob = j.result[key];
    return {
      asks: ob.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>a[0]-b[0]),
      bids: ob.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>b[0]-a[0]),
      symbol: key
    };
  }
  return null;
}

export async function cryptoComBook(): Promise<OrderBook | null> {
  const pairs = ["RARI_USDT","RARI_USD"];
  for (const p of pairs) {
    const u = `https://api.crypto.com/v2/public/get-book?instrument_name=${p}&depth=200`;
    const r = await fetch(u, { cache: "no-store"});
    if (!r.ok) continue;
    const j = await r.json();
    const data = j.result?.data?.[0];
    if (!data?.bids || !data?.asks) continue;
    return {
      asks: data.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>a[0]-b[0]),
      bids: data.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a,b)=>b[0]-a[0]),
      symbol: p
    };
  }
  return null;
}
