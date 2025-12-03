"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard">
                <Image
                  src="/lexance.png"
                  alt="Lexance"
                  width={140}
                  height={40}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition">
                Overview
              </Link>

              <div className="relative group">
                <button className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition flex items-center gap-1">
                  Assets
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-3">
                    <Link href="/dashboard/assets" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Assets Overview</Link>
                    <Link href="/deposit" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Deposit</Link>
                    <Link href="/withdraw" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Withdraw</Link>
                    <Link href="/transfer" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Transfer</Link>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2 mx-4"></div>
                    <Link href="/dashboard/funding" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Funding Account</Link>
                  </div>
                </div>
              </div>
            {/* Invested Products Dropdown */}
<div className="relative group">
  <button className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition flex items-center gap-1">
    Invested Products
    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
    <div className="py-3">
      <Link href="/earn" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium">
        Earn (Savings & Staking)
      </Link>
      <Link href="/dashboard/launchpool" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        Launchpool
      </Link>
      <Link href="/dashboard/dual-investment" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        Dual Investment
      </Link>
      <Link href="/dashboard/auto-invest" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        Auto-Invest
      </Link>
      <div className="border-t border-gray-200 dark:border-gray-800 my-2 mx-4"></div>
      <Link href="/dashboard/copy-trading" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        Copy Trading
      </Link>
      <Link href="/dashboard/structured-products" className="block px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        Structured Products
      </Link>
    </div>
  </div>
</div>
              <Link href="/dashboard/orders" className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition">Orders</Link>
              <Link href="/dashboard/earn" className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition">Earn</Link>
              <Link href="/trade" className="text-gray-900 dark:text-white font-medium hover:text-blue-600 transition">Trade</Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDepositOpen(true)}
                className="hidden sm:block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition cursor-pointer"
              >
                Deposit
              </button>

              {/* Account Dropdown with Logout */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:block text-gray-900 dark:text-white font-medium">Account</span>
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link href="/dashboard" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Overview</Link>
              <Link href="/dashboard/assets" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Assets</Link>
              <Link href="/deposit" className="block px-3 py-2 text-blue-600 font-medium">Deposit</Link>
              <Link href="/withdraw" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Withdraw</Link>
              <Link href="/dashboard/orders" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Orders</Link>
              <Link href="/dashboard/earn" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Earn</Link>
              <Link href="/trade" className="block px-3 py-2 text-gray-900 dark:text-white font-medium">Trade</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 font-medium">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* DEPOSIT DRAWER – FULLY WORKING WITH SLIDE ANIMATION */}
      {isDepositOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
            onClick={() => setIsDepositOpen(false)}
          />

          {/* Sliding Panel */}
          <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out ${isDepositOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
              {/* Deposit Crypto */}
              <div
  onClick={() => {
    setIsDepositOpen(false); // optional: close drawer
    router.push("/deposit/crypto"); // redirect to crypto deposit page
  }}
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

                {/* P2P NGN */}
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
    </>
  );
}