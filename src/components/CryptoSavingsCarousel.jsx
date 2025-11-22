// components/CryptoSavingsCarousel.jsx
import Image from 'next/image';
import Link from 'next/link';

const savings = [
  { symbol: 'USDT', rate: 'Up to 555.00%', label: 'APR', badge: 'New', gradient: 'from-yellow-400 to-orange-500' },
  { symbol: 'BTC', rate: '2.30%', label: 'Savings APR', gradient: 'from-orange-400 to-red-500' },
  { symbol: 'ETH', rate: '0.80%', label: 'Savings APR', gradient: 'from-purple-400 to-pink-500' },
  { symbol: 'BNB', rate: '3.50%', label: 'Savings APR', gradient: 'from-yellow-500 to-green-500' },
  { symbol: 'SOL', rate: '8.20%', label: 'Staking APR', badge: 'Hot', gradient: 'from-pink-500 to-purple-600' },
  { symbol: 'ADA', rate: '4.10%', label: 'Staking APR', gradient: 'from-blue-400 to-cyan-500' },
  { symbol: 'XRP', rate: '5.80%', label: 'Savings APR', gradient: 'from-indigo-400 to-purple-600' },
  { symbol: 'DOGE', rate: '12.50%', label: 'Staking APR', badge: 'Hot', gradient: 'from-amber-400 to-red-600' },
];

// Duplicate the array to create infinite loop
const loopSavings = [...savings, ...savings];

export default function CryptoSavingsCarousel() {
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="animate-scroll flex gap-6">
        {loopSavings.map((item, index) => (
          <Link
            href={`/savings/${item.symbol.toLowerCase()}`}
            key={index}
            className="block shrink-0"
          >
            <div
              className={`
                relative overflow-hidden rounded-2xl shadow-2xl p-8
                w-80 min-w-80 h-56
                bg-linear-to-br ${item.gradient}
                transition-all duration-300
              `}
            >
              {/* Badge */}
              {item.badge && (
                <div className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-bold text-white rounded-full ${
                  item.badge === 'New' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {item.badge}
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <Image
                  src={`/${item.symbol.toLowerCase()}.png`}
                  alt={item.symbol}
                  width={60}
                  height={60}
                />
              </div>

              {/* Text */}
              <div className="text-center text-white">
                <div className="uppercase text-sm font-semibold opacity-90">
                  {item.symbol}
                </div>
                <div className="text-4xl font-bold mt-3">
                  {item.rate}
                </div>
                <div className="text-sm font-medium opacity-90 mt-1">
                  {item.label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-scroll {
          width: max-content;
          animation: scroll 40s linear infinite;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
