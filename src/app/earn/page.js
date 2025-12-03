"use client";
import earnData from '@/data/earn-products.json';

export default function EarnPage() {
  const { stats, promos, products, assets } = earnData;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="bg-linear-to-r from-blue-900 via-purple-900 to-black py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Lexance Earn</h1>
        <p className="text-xl md:text-2xl text-gray-300">
          Don't Just HODL — Grow Your Crypto Holdings The Smart Way
        </p>
      </div>

      {/* Live Stats */}
      <div className="bg-gray-950 py-12 border-b border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 text-center">
          <div>
            <p className="text-gray-400 text-lg">Total Earn Asset</p>
            <p className="text-5xl font-bold mt-2">{stats.total} USD</p>
          </div>
          <div>
            <p className="text-gray-400 text-lg">Yesterday's Yield</p>
            <p className="text-5xl font-bold mt-2 text-green-400">+{stats.yesterday} USD</p>
          </div>
        </div>
      </div>

      {/* Promo Slider */}
      <div className="py-12 bg-black overflow-hidden">
        <div className="animate-slide flex">
          {promos.concat(promos).map((p, i) => (
            <div key={i} className="bg-linear-to-r from-purple-600 to-blue-600 p-8 mx-4 rounded-xl min-w-[320px] text-center">
              {p.isNew && <span className="bg-red-600 px-4 py-1 rounded-full text-sm font-bold">NEW</span>}
              <h3 className="text-2xl font-bold mt-3">{p.title}</h3>
              <p className="text-gray-200 mt-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Explore Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center hover:border-green-500 transition-all">
              <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
              {p.bonus && <span className="bg-green-600 px-4 py-1 rounded-full text-sm">Bonus Available</span>}
              <p className="text-gray-400 my-4">{p.type}</p>
              <p className="text-5xl font-bold text-green-400">{p.apr}</p>
              <button className="mt-8 w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-lg text-lg">
                Invest Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-center mb-12">Available Assets</h2>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-8 py-5 text-left">Asset</th>
                <th className="px-8 py-5 text-left">Duration</th>
                <th className="px-8 py-5 text-left">APR</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((row, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800 transition">
                  <td className="px-8 py-6 font-bold text-lg">{row.coin}</td>
                  <td className="px-8 py-6 text-gray-400">{row.duration}</td>
                  <td className="px-8 py-6 text-green-400 font-bold text-2xl">{row.apr}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-lg">
                      Invest Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite slider animation */}
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide {
          display: flex;
          width: max-content;
          animation: slide 20s linear infinite;
        }
      `}</style>
    </div>
  );
}