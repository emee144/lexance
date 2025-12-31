"use client";

import { useState } from "react";
import Image from "next/image";

const mockOffers = [
  { id: 1, user: "ProTrader99", rating: 99.8, orders: 2850, price: 1620, available: 250000, payment: ["Bank Transfer", "Opay"], time: "15 min" },
  { id: 2, user: "QueenCrypto", rating: 100, orders: 5200, price: 1618, available: 500000, payment: ["Bank Transfer"], time: "10 min" },
  { id: 3, user: "NGNKing", rating: 98.5, orders: 1890, price: 1625, available: 150000, payment: ["Bank Transfer", "Palmpay", "Opay"], time: "5 min" },
  { id: 4, user: "SwiftPay", rating: 99.9, orders: 8120, price: 1615, available: 1000000, payment: ["Bank Transfer"], time: "Instant" },
  { id: 5, user: "MamaCrypto", rating: 97.2, orders: 920, price: 1630, available: 80000, payment: ["Opay", "Palmpay"], time: "30 min" },
];

export default function P2PPage() {
  const [tab, setTab] = useState("buy"); // "buy" or "sell"
  const [paymentMethod, setPaymentMethod] = useState("All Payments");
  const [amount, setAmount] = useState("");

  const payments = ["All Payments", "Bank Transfer", "Opay", "Palmpay"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">P2P Trading</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Buy and sell crypto with NGN · Zero fees</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="inline-flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button
              onClick={() => setTab("buy")}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                tab === "buy" ? "bg-green-500 text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Buy USDT
            </button>
            <button
              onClick={() => setTab("sell")}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                tab === "sell" ? "bg-red-500 text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Sell USDT
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (NGN)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                {payments.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Merchant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Available</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {mockOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {offer.user[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{offer.user}</div>
                            <div className="text-xs text-gray-500">
                              {offer.orders}+ orders · {offer.rating}% ⭐
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{offer.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per USDT</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₦{offer.available.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ~{(offer.available / offer.price).toFixed(2)} USDT
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {offer.payment.map(p => (
                          <span key={p} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className={`px-8 py-3 rounded-lg font-semibold transition ${
                        tab === "buy"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}>
                        {tab === "buy" ? "Buy" : "Sell"} USDT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl px-8 py-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              100% Escrow Protection · Zero Platform Fees · Trade with Verified Merchants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}