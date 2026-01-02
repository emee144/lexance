'use client';

import { useState, useEffect } from 'react';
import AuthPanel from '@/components/AuthPanel';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState([]);
  const [funding, setFunding] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingFunding, setLoadingFunding] = useState(true);
  const [totalAssetsUSDT, setTotalAssetsUSDT] = useState(0);
  const [totalFundingUSDT, setTotalFundingUSDT] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);
        if (!data.loggedIn) {
          setAuthOpen(true); // Open AuthPanel if not logged in
        }
      } catch {
        setIsLoggedIn(false);
        setAuthOpen(true);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingAssets(true);
      try {
        const res = await fetch('/api/auth/assets');
        if (!res.ok) throw new Error();

        const { assets: assetsObj } = await res.json();
        let total = 0;

        const assetsArray = Object.entries(assetsObj).map(([coin, balance]) => {
          const bal = Number(balance);
          total += bal;
          return {
            coin,
            balance: bal.toFixed(8),
          };
        });

        setAssets(assetsArray);
        setTotalAssetsUSDT(total);
      } catch {
        setAssets([]);
        setTotalAssetsUSDT(0);
      } finally {
        setLoadingAssets(false);
      }
    };

    if (isLoggedIn) {
      fetchAssets();
      const interval = setInterval(fetchAssets, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchFunding = async () => {
      setLoadingFunding(true);
      try {
        const res = await fetch('/api/auth/funding');
        if (!res.ok) throw new Error();

        const { funding: fundingObj } = await res.json();
        let total = 0;

        const fundingArray = Object.entries(fundingObj).map(([coin, balance]) => {
          const bal = Number(balance);
          total += bal;
          return {
            coin,
            balance: bal.toFixed(8),
          };
        });

        setFunding(fundingArray);
        setTotalFundingUSDT(total);
      } catch {
        setFunding([]);
        setTotalFundingUSDT(0);
      } finally {
        setLoadingFunding(false);
      }
    };

    if (isLoggedIn) {
      fetchFunding();
      const interval = setInterval(fetchFunding, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const isLoading = activeTab === 'assets' ? loadingAssets : loadingFunding;
  const currentBalances = activeTab === 'assets' ? assets : funding;
  const totalUSDT = activeTab === 'assets' ? totalAssetsUSDT : totalFundingUSDT;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Wallet Overview</h1>

        {!isLoggedIn && (
          <div className="bg-blue-900 border border-blue-600 rounded-xl p-8 text-center mb-8">
            <p className="text-2xl font-bold mb-4">You're viewing as Guest</p>
            <p className="text-lg text-gray-300 mb-6">
              Login to see your real balances and transaction history
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl"
            >
              Login Now
            </button>
          </div>
        )}

        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-8 py-4 text-lg font-medium transition ${
              activeTab === 'assets'
                ? 'border-b-4 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Spot Wallet
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`px-8 py-4 text-lg font-medium transition ${
              activeTab === 'funding'
                ? 'border-b-4 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Funding Wallet
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-8 shadow-2xl">
          <p className="text-sm text-gray-400 mb-2">
            Total {activeTab === 'assets' ? 'Spot' : 'Funding'} Balance
          </p>
          <p className="text-5xl font-bold text-green-400">
            {isLoading ? 'Loading...' : `$${totalUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-gray-500 mt-2">≈ USDT Equivalent</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <a href="/deposit" className="bg-blue-600 hover:bg-blue-700 rounded-xl p-6 text-center font-semibold transition">
            Deposit
          </a>
          <a href="/withdraw" className="bg-red-600 hover:bg-red-700 rounded-xl p-6 text-center font-semibold transition">
            Withdraw
          </a>
          <a href="/transfer" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center font-semibold transition">
            Transfer
          </a>
          <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center font-semibold transition">
            History
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">
              {activeTab === 'assets' ? 'Spot Balances' : 'Funding Balances'}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading balances...</div>
          ) : currentBalances.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No {activeTab === 'assets' ? 'spot' : 'funding'} balance yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-900 text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Coin</th>
                  <th className="px-6 py-4 text-right">Available</th>
                  <th className="px-6 py-4 text-right">On Order</th>
                  <th className="px-6 py-4 text-right">USDT Value</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBalances.map((item) => {
                  const tradePath = activeTab === 'assets' ? '/trade/spot' : '/trade/futures';

                  return (
                    <tr key={item.coin} className="border-t border-gray-800 hover:bg-gray-900 transition">
                      <td className="px-6 py-5 font-medium">{item.coin}</td>
                      <td className="px-6 py-5 text-right">{item.balance}</td>
                      <td className="px-6 py-5 text-right text-gray-500">0.00000000</td>
                      <td className="px-6 py-5 text-right text-gray-300">$0.00</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-4">
                          <a href="/deposit" className="text-blue-400 hover:text-blue-300 text-sm">Deposit</a>
                          <a href="/withdraw" className="text-red-400 hover:text-red-300 text-sm">Withdraw</a>
                          <a href={tradePath} className="text-gray-400 hover:text-gray-300 text-sm">Trade</a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AuthPanel isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}