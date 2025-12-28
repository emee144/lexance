'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = [
    {
      category: 'getting-started',
      title: 'Getting Started',
      items: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" in the top right, enter your email and a strong password, then verify your email. Complete KYC for full access and higher limits.',
        },
        {
          q: 'Do I need KYC to trade?',
          a: 'Basic spot trading is available without KYC. However, withdrawals, futures trading, and higher limits require identity verification.',
        },
      ],
    },
    {
      category: 'deposit-withdrawal',
      title: 'Deposit & Withdrawal',
      items: [
        {
          q: 'How do I deposit cryptocurrency?',
          a: 'Go to Wallet → Deposit → Select coin → Copy your unique deposit address or scan the QR code. Always double-check the network.',
        },
        {
          q: 'Which networks are supported for USDT?',
          a: 'We support USDT on ERC20 and TRC20. TRC20 has much lower fees and is recommended for most users.',
        },
        {
          q: 'Why hasn’t my deposit arrived?',
          a: 'Check the transaction on a blockchain explorer. Most deposits confirm within 1–30 minutes. If delayed over 1 hour, contact support with the TXID.',
        },
        {
          q: 'How do I withdraw funds?',
          a: 'Go to Wallet → Withdraw → Choose coin & network → Enter address and amount → Confirm with 2FA. Withdrawals are processed within 30 minutes.',
        },
        {
          q: 'Are there withdrawal fees?',
          a: 'Yes, fees vary by coin and network. You can see the current fee on the withdrawal page before confirming.',
        },
      ],
    },
    {
      category: 'trading',
      title: 'Trading',
      items: [
        {
          q: 'What is the difference between Spot and Futures?',
          a: 'Spot: You buy/sell actual crypto. Futures: You trade contracts with leverage (up to 125x) to go long or short without owning the asset.',
        },
        {
          q: 'What does leverage mean?',
          a: 'Leverage lets you control a larger position with less money. Example: 20x leverage means $1,000 controls a $20,000 position. Higher reward, higher risk.',
        },
        {
          q: 'What is funding rate?',
          a: 'In perpetual futures, funding is paid every 8 hours between longs and shorts to keep the contract price close to spot price.',
        },
        {
          q: 'What are maker and taker fees?',
          a: 'Maker (limit order that adds liquidity): lower fee. Taker (market order): higher fee. Higher VIP levels = lower fees.',
        },
      ],
    },
    {
      category: 'security',
      title: 'Security',
      items: [
        {
          q: 'How do I keep my account safe?',
          a: 'Enable 2FA, use a strong unique password, enable anti-phishing code, never share your login details or 2FA codes.',
        },
        {
          q: 'What is anti-phishing code?',
          a: 'A custom code you set that appears in every genuine Lexance email. Helps you spot fake/phishing emails.',
        },
        {
          q: 'My account was compromised — what do I do?',
          a: 'Immediately contact support with your account details. We can freeze withdrawals while we investigate.',
        },
      ],
    },
    {
      category: 'account',
      title: 'Account Issues',
      items: [
        {
          q: 'I forgot my password',
          a: 'Click "Forgot Password" on the login page → Enter your email → Follow the reset link sent to you.',
        },
        {
          q: 'I can’t log in',
          a: 'Check your 2FA code, try incognito mode, clear browser cache, or use the password reset flow.',
        },
      ],
    },
  ];

  // Filter based on search and category
  const filteredFaqs = faqs.filter((cat) => {
    if (activeCategory !== 'all' && cat.category !== activeCategory) return false;
    if (!searchQuery) return true;

    return cat.items.some((item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-gray-400 mb-8">
            Find answers to common questions
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="border-b border-gray-800 sticky top-0 bg-[#0b0e11] z-10">
        <div className="mx-auto max-w-5xl flex overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-8 py-4 font-medium border-b-4 transition ${
              activeCategory === 'all'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            All Topics
          </button>
          {faqs.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-8 py-4 font-medium border-b-4 transition whitespace-nowrap ${
                activeCategory === cat.category
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="mx-auto max-w-5xl py-12 px-6">
        {filteredFaqs.length === 0 ? (
          <p className="text-center text-gray-400 text-xl py-20">
            No results found. Try different keywords or{' '}
            <a href="/contact" className="text-blue-400 underline hover:text-blue-300">
              contact support
            </a>
            .
          </p>
        ) : (
          filteredFaqs.map((cat) => (
            <div key={cat.category} className="mb-16">
              <h2 className="text-3xl font-bold mb-8">{cat.title}</h2>
              <div className="space-y-6">
                {cat.items.map((item, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl p-8 shadow-lg hover:shadow-xl transition">
                    <h3 className="text-xl font-semibold mb-4 text-blue-300">{item.q}</h3>
                    <p className="text-gray-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Contact CTA */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-1000 rounded-3xl">
          <h2 className="text-4xl font-bold mb-6">Still need help?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Our support team is available 24/7
          </p>
          <a
            href="/contact"
            className="inline-block px-12 py-5 bg-white text-black font-bold text-xl rounded-xl hover:bg-gray-200 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}