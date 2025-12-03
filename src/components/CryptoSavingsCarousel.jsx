import Image from 'next/image';
import { Sparkles } from 'lucide-react';


const savingsItems = [
  {
    coin: 'USDT',
    icon: '/usdt.png',
    rate: 'Up to 555.00%',
    subtitle: 'APR',
    isNew: true,
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    coin: 'BTC',
    icon: '/btc.png',
    rate: '2.30%',
    subtitle: 'BTC Savings',
    gradient: 'from-orange-400 to-amber-600',
  },
  {
    coin: 'ETH',
    icon: '/eth.png',
    rate: '0.80%',
    subtitle: 'ETH Savings',
    gradient: 'from-indigo-400 to-purple-600',
  },
  {
    coin: 'XRP/USDT',
    icon: '/xrp.png',
    rate: '1.9029',
    subtitle: '-10.20%',
    isNegative: true,
    gradient: 'from-red-400 to-rose-600',
  },
  {
    coin: 'HYPE/USDT',
    icon: '/hype.jpeg',
    rate: '33.38',
    subtitle: '-14.82%',
    isNegative: true,
    gradient: 'from-pink-400 to-purple-600',
  },
  {
    coin: 'ASTER/USDT',
    icon: '/aster.jpeg',
    rate: '1.1485',
    subtitle: '-10.96%',
    isNegative: true,
    gradient: 'from-cyan-400 to-blue-600',
  },
];

// Duplicate for seamless infinite scroll
const carouselItems = [...savingsItems, ...savingsItems];

export default function CryptoSavingsCarousel() {
  return (
    <section className="relative py-24 overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-black">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-wider mb-4">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Exclusive Offer
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
            Make Crypto Work For You
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            New users only — lock in the highest yields in the market
          </p>
        </div>

        {/* Infinite Carousel */}
        <div className="relative">
          <div className="flex gap-8 animate-infinite-scroll">
            {carouselItems.map((item, index) => (
              <div
                key={`${item.coin}-${index}`}
                className="shrink-0 w-96 group"
              >
                <div className="relative h-full">
                  {/* Card Glow */}
                  <div
                    className={`absolute inset-0 ${item.gradient} opacity-60 blur-3xl group-hover:opacity-80 group-hover:blur-2xl transition-all duration-700`}
                  />

                  {/* Main Card */}
                  <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/30 dark:border-gray-700 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-6 hover:scale-105">
                    {/* New Badge */}
                    {item.isNew && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-400 to-orange-600 text-black font-extrabold px-8 py-3 rounded-full text-sm shadow-2xl animate-bounce">
                        NEW USER BONUS
                      </div>
                    )}

                    {/* Coin Icon */}
                    <div className="mb-6">
                      <Image
                        src={item.icon}
                        alt={item.coin}
                        width={88}
                        height={88}
                        className="mx-auto rounded-full ring-8 ring-white/40 shadow-2xl"
                      />
                    </div>

                    {/* Coin Name */}
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                      {item.coin}
                    </h3>

                    {/* Big Rate */}
                    <div className={`text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-linear-to-r ${item.gradient}`}>
                      {item.rate}
                    </div>

                    {/* Subtitle */}
                    <p className={`text-lg font-semibold ${item.isNegative ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                      {item.subtitle}
                    </p>

                    {/* Bottom Accent Line */}
                    <div className={`mt-8 h-1.5 rounded-full bg-linear-to-r ${item.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 60s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}