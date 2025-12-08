"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch your real assets from backend
      const res = await fetch("/api/auth/assets", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        setAssets([]);
        setLoading(false);
        return;
      }

      // 2. Default prices (fallback if CoinGecko fails)
      const fallbackPrices = {
        bitcoin: { usd: 62000, usd_24h_change: 2.5 },
        ethereum: { usd: 2650, usd_24h_change: -1.2 },
        tether: { usd: 1, usd_24h_change: 0 },
        tron: { usd: 0.14, usd_24h_change: 3.1 },
      };

      const coinMap = {
        btc: "bitcoin",
        eth: "ethereum",
        usdt: "tether",
        trx: "tron",
      };

      const ids = data
        .map(a => coinMap[a.symbol?.toLowerCase()])
        .filter(Boolean);

      let priceData = {};

      // 3. Try CoinGecko — if it fails, use fallback
      if (ids.length > 0) {
        try {
          const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
              ","
            )}&vs_currencies=usd&include_24hr_change=true`,
            { cache: "no-store" }
          );
          if (priceRes.ok) {
            priceData = await priceRes.json();
          }
        } catch (e) {
          console.warn("CoinGecko failed, using fallback prices");
        }
      }

      // 4. Final assets with value + change
      const updatedAssets = data.map(a => {
        const id = coinMap[a.symbol?.toLowerCase()];
        const priceInfo = priceData[id] || fallbackPrices[id] || { usd: 0, usd_24h_change: 0 };
        
        return {
          ...a,
          value: Number((a.balance * priceInfo.usd).toFixed(2)),
          change: Number(priceInfo.usd_24h_change.toFixed(2)),
        };
      });

      setAssets(updatedAssets);
    } catch (err) {
      console.error("loadAssets error:", err);
      setError("Network error – using last known data");
      setAssets([]); // Don't break the UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    const interval = setInterval(loadAssets, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">My Portfolio</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">All your assets in one place</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your portfolio...</p>
          </div>
        )}

        {/* Error – but still show assets if any */}
        {error && (
          <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-4 text-center mb-6">
            <p className="text-orange-700 dark:text-orange-400 text-sm">{error}</p>
            <button onClick={loadAssets} className="mt-2 text-sm underline text-blue-600">
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && assets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your wallet is empty. Deposit to get started!
            </p>
          </div>
        )}

        {/* Portfolio */}
        {assets.length > 0 && (
          <>
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl mb-10">
              <p className="text-sm opacity-90 uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-5xl font-bold mt-2">
                ${Number(totalValue).toLocaleString()}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <div
                  key={asset.symbol + (asset.network || "")}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={`/${asset.symbol.toLowerCase()}.png`}
                      alt={asset.symbol}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-bold text-lg">{asset.symbol}</p>
                      <p className="text-sm text-gray-500">
                        {asset.balance.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Value</span>
                      <span className="font-bold text-xl">${asset.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">24h</span>
                      <span className={`font-bold ${asset.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.change >= 0 ? "+" : ""}{asset.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}