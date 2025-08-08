export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { liquidityBandsUSD, coinbaseBook, mexcBook, gateBook, krakenBook, cryptoComBook } from "@/lib/exchanges";

export async function GET() {
  const exchanges = [
    { key: "coinbase", fn: coinbaseBook },
    { key: "mexc", fn: mexcBook },
    { key: "gate", fn: gateBook },
    { key: "kraken", fn: krakenBook },
    { key: "crypto_com", fn: cryptoComBook }
  ] as const;

  const results = await Promise.all(exchanges.map(async (ex) => {
    try {
      const book = await ex.fn();
      if (!book) return { exchange: ex.key, ok: false, error: "pair not found", symbol: null, bands: [] };
      return {
        exchange: ex.key,
        ok: true,
        symbol: book.symbol || null,
        bands: liquidityBandsUSD(book, [1,2,5,10])
      };
    } catch (e:any) {
      return { exchange: ex.key, ok: false, error: e?.message || "error", symbol: null, bands: [] };
    }
  }));

  { 
  const __res = NextResponse.json({ items: results, ts: new Date().toISOString() });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}
}
