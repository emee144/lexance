'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthPanel from './AuthPanel';

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-purple-700 cursor-pointer">Lexance</div>

        <ul className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-200">
          <li className="relative group">
            <span className="cursor-pointer">Trade</span>
            <ul className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/spot" className="block cursor-pointer">Spot</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/futures" className="block cursor-pointer">Futures</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/spread-trading" className="block cursor-pointer">Spread Trading</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/trade/alpha" className="block cursor-pointer">Alpha</Link>
              </li>
            </ul>
          </li>

          <li>
            <Link href="/earn" className="cursor-pointer">Earn</Link>
          </li>

          <li className="relative group">
            <span className="cursor-pointer">Copy Trading</span>
            <ul className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/copy/classic" className="block cursor-pointer">Classic</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href="/copy/pro" className="block cursor-pointer">Pro / Master Trader</Link>
              </li>
            </ul>
          </li>

          <li>
            <Link href="/help" className="cursor-pointer">Help</Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => openAuth('login')}
            className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={() => openAuth('signup')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        <div className="md:hidden">
        </div>
      </div>

      <AuthPanel isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </nav>
  );
}