import Image from 'next/image';

const savingsItems = [
  { coin: 'USDT',      icon: '/usdt.png',   rate: 'Up to 555.00%', subtitle: 'APR',          isNew: true,  glow: 'from-emerald-400 to-teal-600',   textGradient: 'from-emerald-400 to-teal-600',   badge: 'from-amber-400 to-orange-500' },
  { coin: 'BTC',       icon: '/btc.png',    rate: '2.30%',         subtitle: 'BTC Savings',                   glow: 'from-orange-400 to-amber-600',   textGradient: 'from-orange-400 to-amber-600' },
  { coin: 'ETH',       icon: '/eth.png',    rate: '0.80%',         subtitle: 'ETH Savings',                   glow: 'from-indigo-400 to-purple-600',  textGradient: 'from-indigo-400 to-purple-600' },
  { coin: 'XRP/USDT',  icon: '/xrp.png',    rate: '1.9029',        subtitle: '-10.20%',    isNegative: true, glow: 'from-red-400 to-rose-600',       textGradient: 'from-red-400 to-rose-600' },
  { coin: 'HYPE/USDT', icon: '/hype.jpeg',  rate: '33.38',         subtitle: '-14.82%',    isNegative: true, glow: 'from-pink-400 to-purple-600',    textGradient: 'from-pink-400 to-purple-600' },
  { coin: 'ASTER/USDT',icon: '/aster.jpeg', rate: '1.1485',        subtitle: '-10.96%',    isNegative: true, glow: 'from-cyan-400 to-blue-600',      textGradient: 'from-cyan-400 to-blue-600' },
];

export default function CryptoSavingsGrid() {
  return (
    <section className="py-10 bg-gray-950 text-white overflow-hidden relative">
      {/* Background glows – using bg-linear-* to remove warnings */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/10 via-cyan-900/5 to-gray-950" />
      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 via-purple-600/5 to-pink-600/5 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center">
        <p className="mb-6 text-xs text-gray-500">
          New users only — highest yields in the market
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {savingsItems.map((item) => (
            <div key={item.coin} className="group relative">
              {/* Glow */}
              <div className={`absolute inset-0 bg-linear-to-r ${item.glow} opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500`} />

              {/* Card */}
              <div className="relative bg-gray-900/90 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-300">
                {/* NEW Badge */}
                {item.isNew && (
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 bg-linear-to-r ${item.badge} text-black text-[9px] font-bold px-3 py-0.5 rounded-full shadow-lg`}>
                    NEW
                  </div>
                )}

                <Image
                  src={item.icon}
                  alt={item.coin}
                  width={48}
                  height={48}
                  className="mx-auto rounded-full"
                />

                {/* Rate with gradient text */}
                <div className={`mt-3 text-xl font-bold bg-linear-to-r ${item.textGradient} bg-clip-text text-transparent`}>
                  {item.rate}
                </div>

                <p className={`text-[10px] mt-0.5 ${item.isNegative ? 'text-red-400' : 'text-gray-500'}`}>
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}