'use client';

import { useState } from 'react';
export default function LaunchpadPage() {
  const [commitAmount, setCommitAmount] = useState('');
  const [message, setMessage] = useState('');

  const currentProject = {
    name: "Alpha Token",
    symbol: "ALPHA",
    totalRaise: "2,000,000 USDT",
    price: "1 ALPHA = 0.05 USDT",
    yourAllocation: "40,000 ALPHA",
    committed: "500 USDT",
    participants: "8,421",
    progress: 68,
    startDate: "Jan 15, 2026 12:00 UTC",
    endDate: "Jan 18, 2026 12:00 UTC",
    status: "live",
  };

  const handleCommit = () => {
    if (!commitAmount || Number(commitAmount) <= 0) {
      setMessage('Enter a valid amount');
      return;
    }
    setMessage(`Committed ${commitAmount} USDT successfully!`);
    setCommitAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4">Lexance Launchpad</h1>
        <p className="text-xl text-center text-gray-400 mb-12">
          Invest early in vetted projects using USDT
        </p>

        <div className="bg-gradient-to-r from-gray-900 to-gray-1000 rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="bg-gray-800 rounded-full w-50 h-50 flex items-center justify-center border-4 border-yellow-400">
              <span className="text-5xl font-bold">{currentProject.symbol}</span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold mb-2">{currentProject.name} ({currentProject.symbol})</h2>
              <p className="text-2xl mb-4">Total Raise: {currentProject.totalRaise}</p>
              <p className="text-xl text-yellow-300 mb-6">{currentProject.price}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-gray-400">Your Commitment</p>
                  <p className="text-2xl font-bold">{currentProject.committed}</p>
                </div>
                <div>
                  <p className="text-gray-400">Your Allocation</p>
                  <p className="text-2xl font-bold">{currentProject.yourAllocation}</p>
                </div>
                <div>
                  <p className="text-gray-400">Participants</p>
                  <p className="text-xl font-bold">{currentProject.participants}</p>
                </div>
                <div>
                  <p className="text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-green-400">{currentProject.progress}%</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all"
                  style={{ width: `${currentProject.progress}%` }}
                />
              </div>

              <p className="mt-4 text-sm text-gray-400">
                Subscription: {currentProject.startDate} → {currentProject.endDate}
              </p>
            </div>
          </div>

          <div className="mt-12 bg-gray-900/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Commit USDT</h3>
            <div className="max-w-md mx-auto space-y-6">
              <input
                type="number"
                placeholder="Enter USDT amount"
                value={commitAmount}
                onChange={(e) => setCommitAmount(e.target.value)}
                className="w-full px-6 py-4 bg-gray-800 rounded-xl text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleCommit}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl transition"
              >
                Commit USDT
              </button>

              {message && (
                <p className={`text-center text-lg ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Past Launchpad Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {["Project A", "Project B", "Project C"].map((p, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center mb-2">{p}</h3>
                <p className="text-center text-green-400">+1,240% ROI</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}