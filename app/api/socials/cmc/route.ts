export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  { 
  const __res = NextResponse.json({ items: [] });
  __res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  __res.headers.set("Pragma", "no-cache");
  __res.headers.set("Expires", "0");
  __res.headers.set("Surrogate-Control", "no-store");
  __res.headers.set("CDN-Cache-Control", "no-store");
  __res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return __res;
}
}
