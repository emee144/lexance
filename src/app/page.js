"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import Navbar from "@/components/Navbar";

export default function Home() {
const [menuOpen, setMenuOpen] = useState(false);

const [coins, setCoins] = useState([]);

const fetchSpotData = async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,dogecoin,ripple,polkadot,chainlink,polygon,avalanche-2,litecoin,stellar,uniswap,injective-protocol,near,kaspa,pepe,shiba-inu&order=market_cap_desc&sparkline=true",
      { cache: "no-store" }
    );

    const data = await res.json();

    // Optional: map to only the fields you want
    const formatted = data.map((coin) => ({
      id: coin.id,
      pair: `${coin.symbol.toUpperCase()}/USDT`,
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      image: coin.image,
      sparkline: coin.sparkline_in_7d.price,
    }));

    setCoins(formatted);
  } catch (error) {
    console.log("Failed to fetch:", error);
  }
};
useEffect(() => {
  fetchSpotData();
  const interval = setInterval(fetchSpotData, 5000); // optional: refresh every 5 seconds
  return () => clearInterval(interval);
}, []);


return ( <div className="font-sans bg-gray-50 dark:bg-black min-h-screen">
<Navbar />

  {/* Hero Section */}
  <section className="flex flex-col md:flex-row items-center justify-between px-8 py-24 max-w-7xl mx-auto">
    <div className="md:w-1/2">
      <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
        Trade Crypto Effortlessly
      </h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Buy, sell, and manage your crypto with our intuitive platform.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Get Started
        </button>
        <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
          Learn More
        </button>
      </div>
    </div>
    <div className="md:w-1/2 mt-0 md:mt-0">
      <Image src="/crypto.png" alt="Crypto trading" width={500} height={500} className="rounded-full object-cover"/>
    </div>
  </section>
  <section className="px-8 py-20 flex justify-center">
  <AnimatedCard />
  </section>
  {/* Crypto Savings Section */}
  <section className="py-20 bg-blue-50 dark:bg-gray-800">
    <div className="max-w-7xl mx-auto px-8 text-center">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Make crypto work for you
      </h2>
      <p className="mb-12 text-gray-700 dark:text-gray-300">
        New user exclusive
      </p>
     <div className="grid md:grid-cols-3 gap-6">
  {/* USDT */}
  <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
      New
    </div>
    <Image src="/usdt.png" alt="USDT" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">USDT</div>
    <div className="text-2xl font-bold text-green-600 mb-1">Up to 555.00%</div>
    <div className="text-gray-700 dark:text-gray-300">APR</div>
  </div>

  {/* BTC */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <Image src="/btc.png" alt="BTC" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">BTC</div>
    <div className="text-2xl font-bold text-green-600 mb-1">2.30%</div>
    <div className="text-gray-700 dark:text-gray-300">BTC Savings APR</div>
  </div>

  {/* ETH */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <Image src="/eth.png" alt="ETH" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">ETH</div>
    <div className="text-2xl font-bold text-green-600 mb-1">0.80%</div>
    <div className="text-gray-700 dark:text-gray-300">ETH Savings APR</div>
  </div>

  {/* XRP/USDT */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <Image src="/xrp.png" alt="XRP" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">XRP/USDT</div>
    <div className="text-2xl font-bold text-red-600 mb-1">1.9029</div>
    <div className="text-red-600">-10.20%</div>
  </div>

  {/* HYPE/USDT */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <Image src="/hype.jpeg" alt="HYPE" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">HYPE/USDT</div>
    <div className="text-2xl font-bold text-red-600 mb-1">33.38</div>
    <div className="text-red-600">-14.82%</div>
  </div>

  {/* ASTER/USDT */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center">
    <Image src="/aster.jpeg" alt="ASTER" width={40} height={40} className="mb-4" />
    <div className="text-gray-500 dark:text-gray-400 uppercase text-sm mb-2">ASTER/USDT</div>
    <div className="text-2xl font-bold text-red-600 mb-1">1.1485</div>
    <div className="text-red-600">-10.96%</div>
  </div>
</div>

    </div>
  </section>

  {/* Features Section */}
  <section className="py-20 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 px-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fast Trading</h3>
        <p className="text-gray-700 dark:text-gray-300">Execute orders instantly without delays.</p>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure Wallet</h3>
        <p className="text-gray-700 dark:text-gray-300">Your funds are safe with industry-leading security.</p>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Global Access</h3>
        <p className="text-gray-700 dark:text-gray-300">Trade from anywhere, anytime on web or mobile.</p>
      </div>
    </div>
  </section>

  {/* Spot X Section */}
  <section className="py-20 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Spot X</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">Pair</th>
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">Price</th>
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">Change</th>
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
  {coins.map((coin) => (
    <tr key={coin.id} className="border-b border-gray-200 dark:border-gray-700">
      <td className="px-6 py-4 flex items-center gap-3 text-gray-900 dark:text-white font-medium">
        <Image src={coin.image} alt={coin.name} width={24} height={24} />
        {coin.pair}
      </td>

      <td className="px-6 py-4 text-gray-900 dark:text-white">
        ${coin.price.toLocaleString()}
      </td>

      <td
        className={`px-6 py-4 font-semibold ${
          coin.change >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {coin.change.toFixed(2)}%
      </td>

      <td className="px-6 py-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Trade
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  </section>


  <footer className="bg-[#0f0f12] text-gray-300 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Highlights */}
        <div className="grid md:grid-cols-3 gap-10 border-b border-gray-700 pb-10">
          <div>
            <h3 className="text-white font-semibold text-lg">Globally regulated</h3>
            <p className="text-gray-400 mt-2">
              Licensed in Vienna, Cyprus, Dubai & more key markets.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg">Industry-recognized</h3>
            <p className="text-gray-400 mt-2">
              Awarded Best Blockchain Company of the Year 2024.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg">Worldwide support</h3>
            <p className="text-gray-400 mt-2">
              24/7 customer service across 240+ countries.
            </p>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mt-10 mb-6">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            LEXANCE
          </h1>
        </div>

        {/* Link Sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          
          <div>
            <h4 className="text-orange-500 font-semibold mb-3">About</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">About Lexance</a></li>
              <li><a href="#" className="hover:text-blue-400">Meet Team</a></li>
              <li><a href="#" className="hover:text-blue-400">Media</a></li>
              <li><a href="#" className="hover:text-blue-400">Community</a></li>
              <li><a href="#" className="hover:text-blue-400">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400">Security</a></li>
              <li><a href="#" className="hover:text-blue-400">Announcements</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Buy Crypto</a></li>
              <li><a href="#" className="hover:text-blue-400">Earn</a></li>
              <li><a href="#" className="hover:text-blue-400">P2P Trading</a></li>
              <li><a href="#" className="hover:text-blue-400">Wallet</a></li>
              <li><a href="#" className="hover:text-blue-400">API</a></li>
              <li><a href="#" className="hover:text-blue-400">OTC Desk</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Submit Request</a></li>
              <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400">Fees</a></li>
              <li><a href="#" className="hover:text-blue-400">Verification</a></li>
              <li><a href="#" className="hover:text-blue-400">System Status</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Products</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Trade</a></li>
              <li><a href="#" className="hover:text-blue-400">Spot</a></li>
              <li><a href="#" className="hover:text-blue-400">Derivatives</a></li>
              <li><a href="#" className="hover:text-blue-400">Launchpad</a></li>
              <li><a href="#" className="hover:text-blue-400">Lexance Card</a></li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
</div>
  );
}
