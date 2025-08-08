"use client";
import React, { useEffect, useState } from "react";

type ExchangeKey = "coinbase" | "mexc" | "gate" | "kraken" | "crypto_com";

type LiquidityBand = {
  band: number;
  bid_usd: number;
  ask_usd: number;
  total_usd: number;
};

type ExchangeLiquidity = {
  exchange: ExchangeKey;
  symbol: string | null;
  bands: LiquidityBand[];
  ok: boolean;
  error?: string;
};

type MarketData = {
  price_usd: number | null;
  volume_24h_usd: number | null;
  rari_market_cap_usd: number | null;
  global_market_cap_usd: number | null;
  nft_mktpl_category_mcap_usd: number | null;
  ratio_rari_to_global: number | null;
  ratio_rari_to_nftcat: number | null;
};

type Tweet = { id: string; text: string; created_at: string; author?: string };

export default function Dashboard() {
  const [liq, setLiq] = useState<ExchangeLiquidity[] | null>(null);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [tweets, setTweets] = useState<Tweet[] | null>(null);
  const [cmcMentions, setCmcMentions] = useState<any[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastTs, setLastTs] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let timer: any;
  const load = async () => {
      setLoading(true);
      const [liqRes, mRes, twRes, cmcRes] = await Promise.all([
        fetch("/api/liquidity", { cache: "no-store"}).then(r => r.json()),
        fetch("/api/market", { cache: "no-store"}).then(r => r.json()),
        fetch("/api/socials/twitter", { cache: "no-store"}).then(r => r.json()).catch(() => ({ items: [] })),
        fetch("/api/socials/cmc", { cache: "no-store"}).then(r => r.json()).catch(() => ({ items: [] }))
      ]);
      setLiq(liqRes.items || []);
      setMarket(mRes || null);
      setTweets(twRes.items || []);
      setCmcMentions(cmcRes.items || []);
      const tsList = [liqRes?.ts, mRes?.ts].filter(Boolean).map((x:any)=>Date.parse(x));
      if (tsList.length) setLastUpdated(new Date(Math.max(...tsList)).toISOString());
      setLoading(false);
    };
    load();
  timer = setInterval(load, 60_000);
  return () => clearInterval(timer);
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {lastTs && (<div style={{ marginBottom: 8, opacity: 0.7 }}>Обновлено: {new Date(lastTs).toLocaleString()}</div>)}

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Рынок</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <InfoCard title="Цена (USD)" value={fmtPrice3(market?.price_usd)} />
          <InfoCard title="Объем 24ч (USD)" value={fmtUsd(market?.volume_24h_usd)} />
          <InfoCard title="Market Cap RARI" value={fmtUsd(market?.rari_market_cap_usd)} />
          <InfoCard title="Market Cap (всего рынка)" value={fmtUsd(market?.global_market_cap_usd)} />
          <InfoCard title="Категория: NFT Marketplace" value={fmtUsd(market?.nft_mktpl_category_mcap_usd)} />
          <InfoCard title="RARI / Global" value={fmtRatio(market?.ratio_rari_to_global)} />
          <InfoCard title="RARI / NFT-Marketplace" value={fmtRatio(market?.ratio_rari_to_nftcat)} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Ликвидность в зонах (±1%, ±2%, ±5%, ±10%)
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {liq?.map(ex => (
            <div key={ex.exchange} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {ex.exchange.toUpperCase()} {ex.symbol ? `(${ex.symbol})` : ""}
                {!ex.ok && <span style={{ color: "crimson", marginLeft: 8 }}>— {ex.error}</span>}
              </div>
              {ex.ok && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Пояс</th>
                      <th style={th}>Bid USD</th>
                      <th style={th}>Ask USD</th>
                      <th style={th}>Итого USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.bands.map(b => (
                      <tr key={b.band}>
                        <td style={td}>±{b.band}%</td>
                        <td style={td}>{fmtUsd(b.bid_usd)}</td>
                        <td style={td}>{fmtUsd(b.ask_usd)}</td>
                        <td style={td}>{fmtUsd(b.total_usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Последние упоминания</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Twitter ($RARI)</h3>
            {tweets && tweets.length ? (
              <ul style={{ display: "grid", gap: 8 }}>
                {tweets.map(t => (
                  <li key={t.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{new Date(t.created_at).toLocaleString()}</div>
                    <div>{t.text}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ opacity: 0.7 }}>Нет данных (добавь TWITTER_BEARER_TOKEN)</div>
            )}
          </div>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>CoinMarketCap</h3>
            <div style={{ opacity: 0.7 }}>Нет данных (ограничения API CMC — добавим RSS/Pro API/скраппер)</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value?: string | null }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <div style={{ opacity: 0.7 }}>{title}</div>
      <div style={{ fontWeight: 600, fontSize: 18 }}>{value ?? "—"}</div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #eee", padding: 6 };
const td: React.CSSProperties = { borderBottom: "1px solid #f5f5f5", padding: 6 };

function fmtPrice3(n?: number | null) {
  if (!n && n !== 0) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}
function fmtUsd(n?: number | null) {
  if (!n && n !== 0) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtRatio(n?: number | null) {
  if (!n && n !== 0) return "—";
  return (n * 100).toFixed(7) + "%";
}
