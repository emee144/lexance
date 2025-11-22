"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardNavbar from "@/components/DashboardNavbar"; 
import CryptoSavingsCarousel from '@/components/CryptoSavingsCarousel';

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

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

  // Mock data for assets and orders (replace with real API calls)
  const assets = [
    { name: "BTC", balance: 0.5, value: 30000, change: 2.5 },
    { name: "ETH", balance: 10, value: 2500, change: -1.2 },
    { name: "USDT", balance: 1000, value: 1000, change: 0 },
  ];

  const orders = [
    { pair: "BTC/USDT", type: "Buy", amount: 0.1, price: 60000, status: "Filled" },
    { pair: "ETH/USDT", type: "Sell", amount: 5, price: 2500, status: "Pending" },
  ];

  return (
    <div className="font-sans bg-gray-50 dark:bg-black min-h-screen">
      <DashboardNavbar />
      
      {/* Hero Section - Imitating Bybit: Clean banner with balance overview, tagline, and Deposit CTA */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          {/* Left: Welcome Tagline */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              Your Lexance crypto journey, simplified.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your portfolio with ease. Trade, earn, and grow your assets securely.
            </p>
          </div>
          
          {/* Right: Total Balance Card - Bybit-style compact overview */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">${totalBalance.toLocaleString()}</div>
            <div className={`text-sm font-medium mt-1 ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}% Today
            </div>
          </div>
        </div>
        
        {/* Deposit CTA - Prominent button like Bybit */}
        <div className="max-w-7xl mx-auto text-center mt-6">
          <button
  onClick={() => setIsDepositOpen(true)}
  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
>
  Deposit Now
</button>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-8 gap-8">
        {/* Sidebar: Quick Actions & Assets Overview */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Assets Section */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              Assets
            </h2>
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Image 
                      src={`/${asset.name.toLowerCase()}.png`} 
                      alt={asset.name} 
                      width={24} 
                      height={24} 
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{asset.balance} {asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">${asset.value.toLocaleString()}</div>
                    <div className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              View All Assets
            </button>
          </section>

          {/* Quick Actions */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
  onClick={() => setIsDepositOpen(true)}
  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
>
  Deposit
</button>
              <button className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer">Withdraw</button>
              <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">Buy Crypto</button>
              <button className="px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950 cursor-pointer">Earn</button>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
              Recent Orders
              <button className="text-sm text-blue-600 hover:underline cursor-pointer">View All</button>
            </h2>
            <div className="space-y-3">
              {orders.map((order, index) => (
                <div key={index} className="flex justify-between items-center py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${order.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.type}
                    </span>
                    <span>{order.pair}</span>
                  </div>
                  <div className="text-right">
                    <div>${order.price.toLocaleString()}</div>
                    <div className={`font-medium ${order.status === 'Filled' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Content: Trading Panel & Charts */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Animated Card - Reuse from home, perhaps for market overview */}
          <AnimatedCard />

          
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold p-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800">
              Spot X
            </h2>
            <div className="overflow-x-auto p-6">
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
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

         </div> 
      </div>

      <div className="w-full mt-12 px-4 md:px-8 lg:px-0">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Top Savings & Staking
          </h2>
          <CryptoSavingsCarousel />
        </div>
      </div>

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

      {isDepositOpen && (
        <>
          {/* Dark Backdrop (click to close) */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsDepositOpen(false)}
          />

          {/* Sliding Panel from Right */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Payment Method
              </h2>
              <button
                onClick={() => setIsDepositOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Already have crypto → Deposit Crypto */}
              <div
                onClick={() => alert("Redirecting to Crypto Deposit...")}
                className="bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-all border border-blue-200 dark:border-blue-800"
              >
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                  Deposit Crypto
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Already have crypto? Deposit directly
                </p>
              </div>

              {/* Don't have crypto */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                  Don't have crypto?
                </h3>

                {/* P2P Buy with NGN */}
                <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 mb-6 cursor-pointer hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">NGN</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        P2P Trading <span className="text-green-600 font-medium">Recently</span>
                      </p>
                    </div>
                    <p className="text-sm font-medium text-green-600">More Choices, Better Prices</p>
                  </div>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition cursor-pointer">
                    Buy with NGN
                  </button>
                </div>

                {/* Card Payment */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition">
                  <div className="flex justify-center gap-6 mb-6">
                    <Image src="/visa.png" alt="Visa" width={60} height={40} />
                    <Image src="/mastercard.png" alt="Mastercard" width={60} height={40} />
                    <Image src="/americanexpress.png" alt="American Express" width={60} height={60} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Visa, Mastercard and American Express are supported
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}