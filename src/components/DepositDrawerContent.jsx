// components/DepositDrawerContent.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const supportedCoins = [
  { coin: "USDT", name: "Tether", networks: ["TRC20", "ERC20", "BEP20"], popular: true },
  { coin: "BTC", name: "Bitcoin", networks: ["BTC"], popular: true },
  { coin: "ETH", name: "Ethereum", networks: ["ERC20"], popular: true },
  { coin: "BNB", name: "BNB Chain", networks: ["BEP20"] },
  { coin: "SOL", name: "Solana", networks: ["SOL"] },
  { coin: "TRX", name: "TRON", networks: ["TRC20"] },
];

export default function DepositDrawerContent({ onSelectCrypto }) {
  const router = useRouter();

  const handleCoinClick = (coin) => {
    // Inside drawer → just switch view
    if (onSelectCrypto) {
      onSelectCrypto(coin);
    } else {
      // Fallback: full navigation
      router.push(`/deposit/crypto?coin=${coin}`);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deposit Cryptocurrency
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a coin to get your deposit address
        </p>
      </div>

      {/* Popular Coins */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Coins
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {supportedCoins
            .filter(c => c.popular)
            .map((item) => (
              <button
                key={item.coin}
                onClick={() => handleCoinClick(item.coin)}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={`/${item.coin.toLowerCase()}.png`}
                    alt={item.coin}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white">{item.coin}</div>
                    <div className="text-sm text-gray-500">{item.name}</div>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">Select</span>
              </button>
            ))}
        </div>
      </div>

      {/* All Coins */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Coins
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {supportedCoins.map((item) => (
            <button
              key={item.coin}
              onClick={() => handleCoinClick(item.coin)}
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all text-center"
            >
              <Image
                src={`/${item.coin.toLowerCase()}.png`}
                alt={item.coin}
                width={32}
                height={32}
                className="mx-auto mb-2 rounded-full"
              />
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {item.coin}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Zero Deposit Fees · Instant Crediting
        </p>
      </div>
    </div>
  );
}