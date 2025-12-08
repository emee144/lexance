'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f12] text-gray-300 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top 3 Highlights */}
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

        {/* Logo */}
        <div className="mt-10 mb-6">
          <h1 className="text-3xl font-bold text-white tracking-wide">LEXANCE</h1>
        </div>

        {/* Link Sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">

          {/* About */}
          <div>
            <h4 className="text-orange-500 font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-blue-400 block py-1">About Lexance</Link></li>
              <li><Link href="/inquiries" className="hover:text-blue-400 block py-1">Inquiries</Link></li>
              <li><Link href="/careers" className="hover:text-blue-400 block py-1">Careers</Link></li>
              <li><Link href="/security" className="hover:text-blue-400 block py-1">Security</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/login" className="hover:text-blue-400 block py-1">Buy Crypto</Link></li>
              <li><Link href="/earn" className="hover:text-blue-400 block py-1">Earn</Link></li>
              <li><Link href="/p2p" className="hover:text-blue-400 block py-1">P2P Trading</Link></li>
              <li><Link href="/wallet" className="hover:text-blue-400 block py-1">Wallet</Link></li>
  
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/support/request" className="hover:text-blue-400 block py-1">Submit Request</Link></li>
              <li><Link href="/help" className="hover:text-blue-400 block py-1">Help Center</Link></li>
              <li><Link href="/fees" className="hover:text-blue-400 block py-1">Fees</Link></li>
              <li><Link href="/verification" className="hover:text-blue-400 block py-1">Verification</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 block py-1">Contact Us</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-orange-500 font-semibold mb-3">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/trade" className="hover:text-blue-400 block py-1">Trade</Link></li>
              <li><Link href="/spot" className="hover:text-blue-400 block py-1">Spot</Link></li>
              <li><Link href="/derivatives" className="hover:text-blue-400 block py-1">Derivatives</Link></li>
              <li><Link href="/launchpad" className="hover:text-blue-400 block py-1">Launchpad</Link></li>
              <li><Link href="/card" className="hover:text-blue-400 block py-1">Lexance Card</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 text-center text-gray-500 text-xs">
          © 2025 Lexance. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
