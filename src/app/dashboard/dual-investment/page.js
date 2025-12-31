"use client";
import { useState } from 'react';
import dualData from '@/data/dual-investment.json';

export default function DualInvestmentPage() {
  const [selectedProduct, setSelectedProduct] = useState(dualData.products[0]);
  const [amount, setAmount] = useState('');

  const livePrices = {
    'BTC-USDT': 102400,
    'ETH-USDT': 4580
  };

  const currentPrice = livePrices[selectedProduct.pair] || 0;

 
  const calculateYield = () => {
    if (!amount || isNaN(amount)) return { interest: '0.00', total: '0.00' };
    const apr = parseFloat(selectedProduct.apr);
    const days = parseInt(selectedProduct.duration);
    const rate = apr * (days / 365) / 100;
    const principal = parseFloat(amount);
    const interest = principal * rate;
    const total = principal + interest;
    return { interest: interest.toFixed(2), total: total.toFixed(2) };
  };

  const { interest, total } = calculateYield();

  const isBuyLow = selectedProduct.type === 'Buy Low';
  const crypto = selectedProduct.pair.split('-')[0];

  const scenario1 = isBuyLow
    ? `Price ≥ $${selectedProduct.targetPrice.toLocaleString()}: Get ~${(parseFloat(amount) / selectedProduct.targetPrice).toFixed(6)} ${crypto} + yield`
    : `Price ≤ $${selectedProduct.targetPrice.toLocaleString()}: Get $${total} USDT`;

  const scenario2 = isBuyLow
    ? `Price < $${selectedProduct.targetPrice.toLocaleString()}: Get $${total} USDT`
    : `Price > $${selectedProduct.targetPrice.toLocaleString()}: Get ~${(parseFloat(amount) / currentPrice).toFixed(6)} ${crypto} + yield`;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="bg-linear-to-r from-blue-900 via-purple-900 to-black py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Lexance Dual Investment</h1>
        <p className="text-xl md:text-2xl text-gray-300">Earn Up to 312% APR by Predicting BTC & ETH Direction</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dualData.products.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedProduct(p); setAmount(''); }}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                selectedProduct.id === p.id
                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{p.pair}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  p.type === 'Buy Low' ? 'bg-blue-600' : 'bg-red-600'
                }`}>
                  {p.type}
                </span>
              </div>
              <p className="text-3xl font-bold text-green-400">{p.apr}</p>
              <p className="text-gray-400 text-sm">{p.duration}</p>
              <p className="text-gray-500 text-xs mt-2">Target: ${p.targetPrice.toLocaleString()}</p>
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded-3xl p-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">
            {selectedProduct.pair} • {selectedProduct.type}
          </h3>

          <div className="grid grid-cols-2 gap-6 text-lg mb-6">
            <div>Current Price: <span className="text-green-400 font-bold">${currentPrice.toLocaleString()}</span></div>
            <div>Target Price: <span className="font-bold">${selectedProduct.targetPrice.toLocaleString()}</span></div>
          </div>

          <label className="block text-gray-300 mb-3">Investment Amount (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: ${selectedProduct.minAmount} USDT`}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 text-xl focus:border-green-500 focus:outline-none transition"
          />

          {amount && parseFloat(amount) >= selectedProduct.minAmount && (
            <div className="mt-8 p-6 bg-gray-800 rounded-xl">
              <p className="text-gray-400">Estimated Interest</p>
              <p className="text-4xl font-bold text-green-400">+${interest} USDT</p>
              <p className="text-xl mt-2">Total Return: <span className="text-white font-bold">${total}</span></p>
            </div>
          )}

          {/* Outcome Scenarios */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-900/30 rounded-xl border border-blue-700">
              <h4 className="font-bold text-blue-400 mb-3">Bullish Outcome</h4>
              <p className="text-sm leading-relaxed">{scenario1}</p>
            </div>
            <div className="p-6 bg-red-900/30 rounded-xl border border-red-700">
              <h4 className="font-bold text-red-400 mb-3">Bearish Outcome</h4>
              <p className="text-sm leading-relaxed">{scenario2}</p>
            </div>
          </div>

          <button className="mt-10 w-full bg-linear-to-r from-purple-600 to-green-500 hover:from-purple-500 hover:to-green-400 text-white font-bold text-xl py-5 rounded-2xl transition">
            Subscribe Now
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Non-principal protected • Settlement at 8:00 AM UTC • Early exit not allowed
          </p>
        </div>
      </div>
    </div>
  );
}