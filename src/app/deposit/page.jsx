// app/deposit/page.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

const supportedCoins = [
  { coin: "USDT", name: "Tether", networks: ["TRC20", "ERC20", "BEP20"], popular: true },
  { coin: "BTC", name: "Bitcoin", networks: ["BTC"], popular: true },
  { coin: "ETH", name: "Ethereum", networks: ["ERC20"], popular: true },
  { coin: "BNB", name: "BNB Chain", networks: ["BEP20"] },
  { coin: "SOL", name: "Solana", networks: ["SOL"] },
  { coin: "TRX", name: "TRON", networks: ["TRC20"] },
];

export default function DepositLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Deposit Cryptocurrency
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a coin below to get your deposit address
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search coin or network..."
            className="w-full px-6 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Popular Coins */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Popular Coins
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {supportedCoins.filter(c => c.popular).map((item) => (
              <Link key={item.coin} href={`/deposit/crypto?coin=${item.coin}`}>
                <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-800 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Image
                      src={`/${item.coin.toLowerCase()}.png`}
                      alt={item.coin}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {item.coin}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {item.networks.join(" · ")}
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-blue-600 font-medium group-hover:underline">
                      Deposit →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Coins */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            All Supported Coins
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {supportedCoins.map((item) => (
              <Link key={item.coin} href={`/deposit/crypto?coin=${item.coin}`}>
                <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md p-5 hover:shadow-xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-800 text-center cursor-pointer">
                  <Image
                    src={`/${item.coin.toLowerCase()}.png`}
                    alt={item.coin}
                    width={40}
                    height={40}
                    className="mx-auto mb-3 rounded-full"
                  />
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item.coin}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.networks.length} network{item.networks.length > 1 ? "s" : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-16 bg-blue-50 dark:bg-blue-950/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Zero Deposit Fees · Instant Crediting
          </h3>
          <p className="text-lg text-blue-800 dark:text-blue-200">
            All deposits are free and credited within minutes after network confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
