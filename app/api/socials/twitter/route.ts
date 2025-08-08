export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) { 
  const __res = NextResponse.json({ items: [] });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}

  const q = encodeURIComponent("$RARI (coin OR crypto OR token) -is:retweet");
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${q}&max_results=10&tweet.fields=created_at,author_id`;

  const r = await fetch(url, { cache: "no-store",  headers: { Authorization: `Bearer ${token}` }});
  if (!r.ok) { 
  const __res = NextResponse.json({ items: [] });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}

  const j = await r.json();
  const items = (j.data || []).map((t:any) => ({
    id: t.id,
    text: t.text,
    created_at: t.created_at
  }));
  { 
  const __res = NextResponse.json({ items });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}
}
