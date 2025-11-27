"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import DashboardNavbar from "@/components/DashboardNavbar";
import CryptoSavingsCarousel from "@/components/CryptoSavingsCarousel";
import DepositDrawerContent from "@/components/DepositDrawerContent";
import DepositCryptoPage from "@/app/deposit/crypto/page";
import WithdrawForm from "@/components/WithdrawForm";
import AnimatedCard from "@/components/AnimatedCard";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [coins, setCoins] = useState([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositView, setDepositView] = useState("main");
  const [selectedDepositCoin, setSelectedDepositCoin] = useState("USDT");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

const fetchAssets = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/login";

    // Fetch user balances
    const res = await fetch("/api/auth/assets", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch assets");
    const data = await res.json();

    // Map symbols to CoinGecko IDs
    const coinMap = { btc: "bitcoin", eth: "ethereum", usdt: "tether", sol: "solana" /* ... etc */ };
    const ids = data.map(a => coinMap[a.symbol.toLowerCase()]).filter(Boolean);

    // Fetch live USD prices
    const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`);
    const priceData = await priceRes.json();

    // Calculate values
    const updatedAssets = data.map(a => {
      const id = coinMap[a.symbol.toLowerCase()];
      const priceUSD = priceData[id]?.usd ?? 0;
      return { ...a, value: a.balance * priceUSD };
    });

    // Update state **only after all prices are fetched**
    setAssets(updatedAssets);

  } catch (err) {
    console.error(err);
   
  }
};

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
      console.error("Failed to fetch spot data:", error);
    }
  };

  // Load data on mount + refresh
  useEffect(() => {
    fetchAssets();
    fetchSpotData();

    const assetsInterval = setInterval(fetchAssets, 10000);
    const spotInterval = setInterval(fetchSpotData, 8000);

    return () => {
      clearInterval(assetsInterval);
      clearInterval(spotInterval);
    };
  }, []);

  // REAL calculations
  const totalBalance = assets.reduce((sum, a) => sum + a.value, 0);
  const totalPnlWeighted = assets.length > 0
    ? assets.reduce((sum, a) => sum + (a.change * a.value), 0) / totalBalance
    : 0;

const orders = [
  { pair: "BTC/USDT", type: "Buy", amount: 0.005, price: 61234.56, status: "Filled", time: "2 min ago" },
  { pair: "ETH/USDT", type: "Sell", amount: 1.2, price: 2654.32, status: "Filled", time: "5 min ago" },
  { pair: "SOL/USDT", type: "Buy", amount: 15, price: 138.45, status: "Pending", time: "8 min ago" },
];
  const openDeposit = (view = "main") => {
    setDepositView(view);
    setIsDepositOpen(true);
  };

  const openWithdraw = () => setIsWithdrawOpen(true);

  return (
    <div className="font-sans bg-gray-50 dark:bg-black min-h-screen flex flex-col">
      <DashboardNavbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              Your Lexance crypto journey, simplified.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your portfolio with ease. Trade, earn, and grow your assets securely.
            </p>
          </div>

          {/* Total Balance Card */}
          <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium mb-2">
              Total Portfolio Value
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-lg font-semibold mt-2 ${totalPnlWeighted >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnlWeighted >= 0 ? "Up" : "Down"} {Math.abs(totalPnlWeighted).toFixed(2)}% Today
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center mt-8">
          <button
            onClick={() => openDeposit("main")}
            className="px-10 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transform hover:scale-105 transition"
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
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Assets</h2>
            {assets.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No assets yet. Deposit to start!</p>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div
                    key={`${asset.symbol}-${asset.network}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={`/${asset.symbol.toLowerCase()}.png`}
                        alt={asset.name}
                        width={48}
                        height={48}
                        className="rounded-full ring-4 ring-white dark:ring-gray-900 shadow-md"
                        unoptimized
                      />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {asset.symbol}
                          {asset.network && <span className="text-xs text-gray-500 ml-2">({asset.network})</span>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {asset.balance.toFixed(6)} {asset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ${asset.value.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {asset.change >= 0 ? "Up" : "Down"} {Math.abs(asset.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/assets">
  <button className="w-full mt-6 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
    View All Assets
  </button>
</Link>
          </section>

          {/* Quick Actions */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openDeposit("main")} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Deposit
              </button>
              <button onClick={() => openWithdraw()} className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">
                Withdraw
              </button>
              <Link href="/deposit/crypto">
              <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Buy Crypto</button>
              </Link>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {depositView === "main" ? (
          <DepositDrawerContent
            onSelectCrypto={(coin) => {
              setSelectedDepositCoin(coin);
              setDepositView("crypto");
            }}
          />
        ) : (
          <DepositCryptoPage
            selectedCoin={selectedDepositCoin}
            onBack={() => setDepositView("main")}
          />
        )}
      </div>
    </div>
  </>
)}

{/* ==================== WITHDRAW DRAWER ==================== */}
{isWithdrawOpen && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={() => setIsWithdrawOpen(false)}
    />

    {/* Drawer */}
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw</h2>
        <button
          onClick={() => setIsWithdrawOpen(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <WithdrawForm />
      </div>
    </div>
  </>
)}
    </div>
  );
}