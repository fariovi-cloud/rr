export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  const [coinRes, globalRes, catsRes] = await Promise.all([
    fetch("https://api.coingecko.com/api/v3/coins/rarible", { cache: "no-store"}),
    fetch("https://api.coingecko.com/api/v3/global", { cache: "no-store"}),
    fetch("https://api.coingecko.com/api/v3/coins/categories", { cache: "no-store"})
  ]);

  const coin = coinRes.ok ? await coinRes.json() : null;
  const global = globalRes.ok ? await globalRes.json() : null;
  const cats = catsRes.ok ? await catsRes.json() : [];

  const nftCat = Array.isArray(cats) ? cats.find((c:any) => (c.category_id || c.id) === "nft-marketplace" || /nft.*market/i.test(c.name)) : null;

  const price = coin?.market_data?.current_price?.usd ?? null;
  const vol = coin?.market_data?.total_volume?.usd ?? null;
  const rariMc = coin?.market_data?.market_cap?.usd ?? null;
  const globalMc = global?.data?.total_market_cap?.usd ?? null;
  const nftMc = nftCat?.market_cap ?? null;

  const ratioGlobal = rariMc && globalMc ? rariMc / globalMc : null;
  const ratioNft = rariMc && nftMc ? rariMc / nftMc : null;

  { 
  const __res = NextResponse.json({
    price_usd: price,
    volume_24h_usd: vol,
    rari_market_cap_usd: rariMc,
    global_market_cap_usd: globalMc,
    nft_mktpl_category_mcap_usd: nftMc,
    ratio_rari_to_global: ratioGlobal,
    ratio_rari_to_nftcat: ratioNft,
    ts: new Date().toISOString()
  });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}
}
