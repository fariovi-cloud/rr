export async function gateBook(pair: string) {
  const u = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair}&limit=200`;
  const r = await fetch(u, { cache: 'no-store' });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.asks || !j.bids) return null;
  return {
    asks: j.asks.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a: [number, number], b: [number, number]) => a[0] - b[0]),
    bids: j.bids.map((x: [string,string]) => [parseFloat(x[0]), parseFloat(x[1])]).sort((a: [number, number], b: [number, number]) => b[0] - a[0]),
    symbol: pair
  };
}