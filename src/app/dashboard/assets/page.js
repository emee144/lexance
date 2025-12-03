"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices(ids) {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
      );
      const data = await res.json();
      return data;
    }

async function loadAssets() {
  try {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/assets", {
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      throw new Error("Failed to load assets");
    }

    const data = await res.json(); // <-- THIS WAS MISSING

    // Map symbols to CoinGecko IDs
    const coinMap = {
      btc: "bitcoin",
      eth: "ethereum",
      usdt: "tether",
      trx: "tron",
    };

    const ids = data.map(a => coinMap[a.symbol.toLowerCase()]).filter(Boolean);

    const priceData = await fetchPrices(ids);

    const updatedAssets = data.map(a => {
      const id = coinMap[a.symbol.toLowerCase()];
      const priceUSD = priceData[id]?.usd || 0;
      return { ...a, value: a.balance * priceUSD };
    });

    setAssets(updatedAssets);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch assets");
  } finally {
    setLoading(false);
  }
}

    loadAssets();
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">My Portfolio</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">All your assets in one place</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-300">Loading portfolio...</div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center mb-6">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Please log in again.</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && assets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Your wallet is empty. Deposit BTC, ETH, TRX, or USDT to start building your portfolio.
            </p>
          </div>
        )}

        {/* ASSETS */}
        {!loading && !error && assets.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center mb-8 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Total Portfolio Value</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {assets.length} asset{assets.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <div key={asset.address} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <Image src={`/${asset.symbol.toLowerCase()}.png`} alt={asset.name} width={40} height={40} className="rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{asset.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.balance.toLocaleString()} {asset.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Value:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${asset.value.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-1">
                    <span>24h:</span>
                    <span className={asset.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {asset.change >= 0 ? "+" : "-"}{Math.abs(asset.change)}%
                    </span>
                  </div>

                  {asset.network && asset.network !== "ERC20" && asset.network !== "TRC20" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{asset.network}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
