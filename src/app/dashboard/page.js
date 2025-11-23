"use client";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

import AnimatedCard from "@/components/AnimatedCard";
import DashboardNavbar from "@/components/DashboardNavbar";
import CryptoSavingsCarousel from "@/components/CryptoSavingsCarousel";
import DepositDrawerContent from "@/components/DepositDrawerContent";
import DepositCryptoPage from "@/app/deposit/crypto/page";

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [totalBalance] = useState(0);
  const [totalPnl] = useState(0);
  const [selectedDepositCoin, setSelectedDepositCoin] = useState("USDT");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositView, setDepositView] = useState("main"); // "main" or "crypto"

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
        image: coin.image,
      }));
      setCoins(formatted);
    } catch (error) {
      console.error("Failed to fetch coins:", error);
    }
  };

  useEffect(() => {
    fetchSpotData();
    const interval = setInterval(fetchSpotData, 8000);
    return () => clearInterval(interval);
  }, []);

  const assets = [
    { name: "BTC", balance: 0.5, value: 30000, change: 2.5 },
    { name: "ETH", balance: 10, value: 2500, change: -1.2 },
    { name: "USDT", balance: 1000, value: 1000, change: 0 },
  ];

  const orders = [
    { pair: "BTC/USDT", type: "Buy", amount: 0.1, price: 60000, status: "Filled" },
    { pair: "ETH/USDT", type: "Sell", amount: 5, price: 2500, status: "Pending" },
  ];

  const openDeposit = (view = "main") => {
    setDepositView(view);
    setIsDepositOpen(true);
  };

  return (
    <div className="font-sans bg-gray-50 dark:bg-black min-h-screen flex flex-col">
      <DashboardNavbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              Your Lexance crypto journey, simplified.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your portfolio with ease. Trade, earn, and grow your assets securely.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Total Balance
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${totalBalance.toLocaleString()}
            </div>
            <div className={`text-sm font-medium mt-1 ${totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}% Today
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center mt-6">
          <button
            onClick={() => openDeposit("main")}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Deposit Now
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto p-8 gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Assets */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Assets</h2>
            <div className="space-y-3">
              {assets.map((asset, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
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
                    <div className={`text-sm ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {asset.change >= 0 ? "+" : ""}{asset.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              View All Assets
            </button>
          </section>

          {/* Quick Actions */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openDeposit("main")} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Deposit
              </button>
              <button className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">
                Withdraw
              </button>
              <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Buy Crypto</button>
              <button className="px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950">
                Earn
              </button>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
              Recent Orders
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </h2>
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div key={i} className="flex justify-between items-center py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${order.type === "Buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {order.type}
                    </span>
                    <span>{order.pair}</span>
                  </div>
                  <div className="text-right">
                    <div>${order.price.toLocaleString()}</div>
                    <div className={`font-medium ${order.status === "Filled" ? "text-green-600" : "text-yellow-600"}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Panel */}
        <div className="w-full lg:w-2/3 space-y-6">
          <AnimatedCard />

          {/* Spot Table */}
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
                    <tr key={coin.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 flex items-center gap-3 text-gray-900 dark:text-white font-medium">
                        <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" />
                        {coin.pair}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">${coin.price?.toLocaleString() ?? "-"}</td>
                      <td className={`px-6 py-4 font-semibold ${coin.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {coin.change?.toFixed(2) ?? "0.00"}%
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
          </section>
        </div>
      </div>

     {/* Top Savings & Staking - Fixed */}
<div className="w-full px-4 md:px-8 lg:px-0 mt-12">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
      Top Savings & Staking
    </h2>
    <CryptoSavingsCarousel />
  </div>
</div>

      {/* ========== YOUR ORIGINAL LEXANCE FOOTER ========== */}
      <footer className="bg-[#0f0f12] text-gray-300 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
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

          <div className="mt-10 mb-6">
            <h1 className="text-3xl font-bold text-white tracking-wide">LEXANCE</h1>
          </div>

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

      {/* ==================== DEPOSIT DRAWER ==================== */}
{isDepositOpen && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={() => setIsDepositOpen(false)}
    />

    {/* Drawer */}
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
        {depositView === "crypto" ? (
          <button
            onClick={() => setDepositView("main")}
            className="text-blue-600 font-bold flex items-center gap-2 hover:underline"
          >
            Back
          </button>
        ) : (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit</h2>
        )}
        <button
          onClick={() => setIsDepositOpen(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content — THIS IS THE ONLY PART THAT CHANGED */}
      <div className="flex-1 overflow-y-auto">
  {depositView === "main" ? (
    <DepositDrawerContent
      onSelectCrypto={(coin) => {
        setSelectedDepositCoin(coin);   // ← use React state (best way)
        setDepositView("crypto");
      }}
    />
  ) : (
    <DepositCryptoPage
      selectedCoin={selectedDepositCoin}   // ← pass the coin here
      onBack={() => setDepositView("main")}
    />
  )}
</div>
    </div>
  </>
)}
    </div>
  );
}