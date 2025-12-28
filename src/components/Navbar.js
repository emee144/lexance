"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-purple-700">Lexance</div>

        {/* Nav Links */}
        <ul className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-200">

          {/* Trade */}
          <li className="relative group">
            <span className="cursor-pointer">Trade</span>

            <ul className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/spot">Spot</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/futures">Futures</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/spread-trading">Spread Trading</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/alpha">Alpha</Link>
              </li>
            </ul>
          </li>

          {/* Earn */}
          <li><Link href="/earn">Earn</Link></li>

          {/* Copy Trading */}
          <li className="relative group">
            <span className="cursor-pointer">Copy Trading</span>

            <ul className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/copy/classic">Classic</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/copy/pro">Pro / Master Trader</Link>
              </li>
            </ul>
          </li>

          {/* Help */}
          <li><Link href="/help">Help</Link></li>
        </ul>

        {/* Login + Signup */}
        <div className="hidden md:flex items-center space-x-4">

          {/* Login */}
          <Link
            href="/login"
            className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition"
          >
            Login
          </Link>

          {/* Sign Up */}
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            Sign Up
          </Link>

        </div>

        {/* Mobile */}
        <div className="md:hidden">{/* hamburger goes here */}</div>

      </div>
    </nav>
  );
}
