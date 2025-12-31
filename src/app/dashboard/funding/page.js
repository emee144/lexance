'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function FundingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [fundingBalance, setFundingBalance] = useState({});
  const [depositAddresses, setDepositAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [depositNetwork, setDepositNetwork] = useState('ERC20');
  const [withdrawNetwork, setWithdrawNetwork] = useState('ERC20');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const COINS = ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA"];

  const SUPPORTED_NETWORKS = {
    USDT: ['TRC20', 'ERC20'],
    BTC: ['BTC', 'BECH32'],
    ETH: ['ERC20'],
    BNB: ['BEP20'],
    SOL: ['SOL'],
    TRX: ['TRC20'],
    ADA: ['ADA'],
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.loggedIn === true);
        if (!data.loggedIn) router.push('/login');
      } catch {
        setIsLoggedIn(false);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFundingBalance = async () => {
      try {
        const res = await fetch('/api/auth/funding');
        if (res.ok) {
          const data = await res.json();
          setFundingBalance(data.funding || {});
        }
      } catch (err) {
        console.error('Funding balance fetch error:', err);
      }
    };

    fetchFundingBalance();
    const interval = setInterval(fetchFundingBalance, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchDepositAddresses = async () => {
      try {
        const res = await fetch('/api/auth/deposits/address');
        if (res.ok) {
          const data = await res.json();
          setDepositAddresses(data);
        } else if (res.status === 401) {
          setIsLoggedIn(false);
          router.push('/login');
        }
      } catch (err) {
        console.error('Deposit addresses fetch error:', err);
      }
    };

    fetchDepositAddresses();
  }, [isLoggedIn, router]);

  useEffect(() => {
    const networks = SUPPORTED_NETWORKS[selectedCoin] || [];
    setDepositNetwork(networks[0] || '');
    setWithdrawNetwork(networks[0] || '');
  }, [selectedCoin]);

  const handleWithdraw = async () => {
    setMessage('');
    setLoading(true);

    if (!withdrawAmount || !withdrawAddress || !withdrawNetwork) {
      setMessage('Please fill all fields');
      setLoading(false);
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Invalid amount');
      setLoading(false);
      return;
    }

    if (amount > (fundingBalance[selectedCoin] || 0)) {
      setMessage('Insufficient funding balance');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin: selectedCoin,
          amount,
          address: withdrawAddress.trim(),
          network: withdrawNetwork,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(`Withdrawal of ${amount} ${selectedCoin} submitted successfully!`);
        setWithdrawAmount('');
        setWithdrawAddress('');
        const refresh = await fetch('/api/auth/funding');
        const data = await refresh.json();
        setFundingBalance(data.funding || {});
      } else {
        setMessage(result.error || 'Withdrawal failed');
      }
    } catch {
      setMessage('Network error');
    }

    setLoading(false);
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e11] text-white text-3xl">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const currentDeposit = depositAddresses.find(
    addr => addr.coin === selectedCoin && addr.network === depositNetwork
  );

  const currentAddress = currentDeposit?.address || null;
  const currentMemo = currentDeposit?.memo || null;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Funding Wallet</h1>

        <div className="flex border-b border-gray-800 mb-10">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-8 py-4 text-lg font-medium transition ${
              activeTab === 'deposit'
                ? 'border-b-4 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-8 py-4 text-lg font-medium transition ${
              activeTab === 'withdraw'
                ? 'border-b-4 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>

        {activeTab === 'deposit' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">Deposit</h2>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Select Coin</label>
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full bg-gray-800 rounded-xl px-5 py-4 text-xl focus:ring-4 focus:ring-blue-500 outline-none"
                >
                  {COINS.map((coin) => (
                    <option key={coin} value={coin}>{coin}</option>
                  ))}
                </select>
              </div>

              {SUPPORTED_NETWORKS[selectedCoin]?.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-3">Select Network</label>
                  <select
                    value={depositNetwork}
                    onChange={(e) => setDepositNetwork(e.target.value)}
                    className="w-full bg-gray-800 rounded-xl px-5 py-4 text-xl focus:ring-4 focus:ring-blue-500 outline-none"
                  >
                    {SUPPORTED_NETWORKS[selectedCoin].map((net) => (
                      <option key={net} value={net}>
                        {net} {net === 'TRC20' && '(Recommended)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentAddress ? (
                <div className="bg-gray-900 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-4">Deposit Address ({depositNetwork})</p>
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-5 py-4">
                    <code className="text-sm break-all font-mono">{currentAddress}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentAddress);
                        setMessage('Address copied!');
                        setTimeout(() => setMessage(''), 3000);
                      }}
                      className="ml-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                    >
                      Copy
                    </button>
                  </div>

                  {currentMemo && (
                    <div className="mt-4 bg-yellow-900 bg-opacity-30 rounded-lg p-4">
                      <p className="text-sm text-yellow-300 mb-2">Memo / Tag (Required)</p>
                      <div className="flex items-center justify-between bg-gray-800 rounded px-4 py-3">
                        <span className="font-mono">{currentMemo}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentMemo);
                            setMessage('Memo copied!');
                            setTimeout(() => setMessage(''), 3000);
                          }}
                          className="ml-4 text-yellow-300 hover:text-yellow-200"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-yellow-400 mt-2">
                        ⚠️ Deposits without memo will be lost.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-red-400 mt-4">
                    ⚠️ Send only {selectedCoin} on {depositNetwork}.
                  </p>
                </div>
              ) : (
                <div className="bg-red-900 bg-opacity-40 rounded-xl p-8 text-center">
                  <p className="text-xl">No deposit address available</p>
                </div>
              )}
            </div>

            {currentAddress && (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-3xl shadow-2xl">
                  <QRCodeSVG
                    value={currentAddress}
                    size={320}
                    level="H"
                    fgColor="#000000"
                    bgColor="#ffffff"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-8 text-xl text-gray-300">Scan ({depositNetwork})</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1a1a1a] rounded-2xl p-10 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">Withdraw</h2>

              <div className="mb-8">
                <label className="block text-sm text-gray-400 mb-3">Coin</label>
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full bg-gray-800 rounded-xl px-5 py-4 text-xl focus:ring-4 focus:ring-blue-500 outline-none"
                >
                  {COINS.map((coin) => (
                    <option key={coin} value={coin}>{coin}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8 bg-gray-900 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-2">Funding Wallet Balance</p>
                <p className="text-4xl font-bold text-green-400">
                  {(fundingBalance[selectedCoin] || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })} {selectedCoin}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Network</label>
                <select
                  value={withdrawNetwork}
                  onChange={(e) => setWithdrawNetwork(e.target.value)}
                  className="w-full bg-gray-800 rounded-xl px-5 py-4 text-xl focus:ring-4 focus:ring-blue-500 outline-none"
                >
                  {SUPPORTED_NETWORKS[selectedCoin]?.map((net) => (
                    <option key={net} value={net}>
                      {net} {net === 'TRC20' && '(Recommended)'}
                    </option>
                  ))}
                </select>
              </div>
              
              <input
                type="text"
                placeholder="Withdrawal address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-5 py-4 mb-6 text-lg focus:ring-4 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-5 py-4 mb-8 text-lg focus:ring-4 focus:ring-blue-500 outline-none"
              />

              {message && (
                <div className={`mb-6 p-4 rounded-xl text-center text-lg font-medium ${
                  message.includes('successfully') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 py-5 rounded-xl font-bold text-2xl transition"
              >
                {loading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
