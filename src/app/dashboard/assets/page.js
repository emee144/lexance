'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AuthPanel from '@/components/AuthPanel';

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const coinIcons = {
    USDT: "/usdt.png",
    BTC: "/btc.png",
    ETH: "/eth.png",
    TRX: "/trx.png",
    BNB: "/bnb.png",
    SOL: "/sol.png",
    ADA: "/ada.png",
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/assets", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        setAuthOpen(true);
        return;
      }

      if (!res.ok) throw new Error("Failed to load assets");

      const data = await res.json();
      const assetsObj = data.assets || {};

      const updatedAssets = Object.entries(assetsObj).map(([symbol, balance]) => ({
        symbol,
        balance: Number(balance ?? 0),
        value: Number(balance ?? 0),
        change: 0,
      })).sort((a, b) => b.value - a.value);

      setAssets(updatedAssets);
    } catch (err) {
      console.error("Assets load error:", err);
      setError("Failed to load portfolio");
      setAssets([]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">My Portfolio</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">All your assets in one place</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-center mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button onClick={loadAssets} className="mt-2 text-sm underline text-blue-600">
              Retry
            </button>
          </div>
        )}

        {assets.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your wallet is empty. Make your first deposit!
            </p>
          </div>
        )}

        {assets.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl mb-10">
              <p className="text-sm opacity-90 uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-5xl font-bold mt-2">
                ${Number(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <div
                  key={asset.symbol}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={coinIcons[asset.symbol] || "/usdt.png"}
                      alt={asset.symbol}
                      width={48}
                      height={48}
                      className="rounded-full"
                      unoptimized
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
                      <span className="font-bold text-xl">
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
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

      <AuthPanel isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}