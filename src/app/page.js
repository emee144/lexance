"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import AuthPanel from "@/components/AuthPanel";
import Footer from "@/components/Footer";
import CryptoSavingsCarousel from "@/components/CryptoSavingsCarousel";
import CryptoSavingsGrid from "@/components/CryptoSavingsGrid";

export default function Home() {
const [menuOpen, setMenuOpen] = useState(false);
const [authOpen, setAuthOpen] = useState(false);

const [coins, setCoins] = useState([]);

const fetchSpotData = async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,dogecoin,ripple,polkadot,chainlink,polygon,avalanche-2,litecoin,stellar,uniswap,injective-protocol,near,kaspa,pepe,shiba-inu&order=market_cap_desc&sparkline=true",
      { cache: "no-store" }
    );

    const data = await res.json();

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
  const interval = setInterval(fetchSpotData, 5000); 
  return () => clearInterval(interval);
}, []);


return ( <div className="font-sans bg-gray-50 dark:bg-black min-h-screen">
<Navbar />

  <section className="flex flex-col md:flex-row items-center justify-between px-8 py-24 max-w-7xl mx-auto">
    <div className="md:w-1/2">
      <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
        Trade Crypto Effortlessly
      </h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Buy, sell, and manage your crypto with our intuitive platform.
      </p>
      <div className="flex gap-4">
        <button
              onClick={() => setAuthOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold cursor-pointer"
            >
              Get Started
            </button>
        <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
          <Link href="/about">
          About
          </Link>
        </button>
      </div>
    </div>
    
   <CryptoSavingsGrid/>
  
  </section>
  <section className="px-8 py-20 flex justify-center">
  <AnimatedCard />
  </section>

 <CryptoSavingsCarousel />
 
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


  <Footer />
  <AuthPanel isOpen={authOpen} onClose={() => setAuthOpen(false)} />
</div>
  );
}
