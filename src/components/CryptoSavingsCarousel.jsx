"use client";
import Image from "next/image";
const products = [
  { coin: "USDT", apr: "555.00", label: "New", hot: false },
  { coin: "BTC", apr: "2.30", label: null, hot: false },
  { coin: "ETH", apr: "0.80", label: null, hot: false },
  { coin: "BNB", apr: "3.50", label: null, hot: false },
  { coin: "SOL", apr: "8.20", label: "Hot", hot: true },
  { coin: "ADA", apr: "4.10", label: null, hot: false },
  { coin: "XRP", apr: "5.80", label: null, hot: false },
  { coin: "DOGE", apr: "12.50", label: "Hot", hot: true },
  { coin: "TRX", apr: "6.80", label: "New", hot: false },
  { coin: "LINK", apr: "4.20", label: null, hot: false },
];

export default function CryptoSavingsCarousel() {
  return (
    <div className="overflow-hidden">
      <div className="inline-flex animate-marquee">
        {/* First set */}
        <div className="flex gap-6">
          {products.map((item, i) => (
            <Card key={`a-${i}`} item={item} />
          ))}
        </div>
        {/* Duplicate set — this is what makes it seamless */}
        <div className="flex gap-6">
          {products.map((item, i) => (
            <Card key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Critical CSS Fix: Right to Left + Infinite */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 35s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function Card({ item }) {
  return (
    <div className="w-72 shrink-0 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-800">
      {item.label && (
        <span
          className={`inline-block px-2 py-1 mb-3 text-xs font-bold rounded-full ${
            item.label === "New" ? "bg-orange-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {item.label}
        </span>
      )}

      <div className="mb-4 flex items-center gap-3">
        <Image
          src={`/${item.coin.toLowerCase()}.png`}
          alt={item.coin}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {item.coin}
        </div>
      </div>

      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
        {item.apr}%
      </div>

      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {item.hot ? "Staking APR" : "Savings APR"}
      </div>
    </div>
  );
}