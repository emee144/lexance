"use client";
import { useState, useEffect } from "react";

export default function WithdrawForm() {
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  const externalWithdrawalFees = {
    USDT: { TRC20: 1, ERC20: 5, BEP20: 1 },
    BTC: { BTC: 0.0005, "BTC-Bech32": 0.0005 },
    ETH: { ERC20: 0.005 },
    BNB: { BEP20: 0.001 },
    TRX: { TRC20: 1 },
  };

  const networkOptions = {
    USDT: ["TRC20", "ERC20", "BEP20"],
    BTC: ["BTC", "BTC-Bech32"],
    ETH: ["ERC20"],
    BNB: ["BEP20"],
    TRX: ["TRC20"],
  };

  const formatBalance = (value) => {
    if (!value || value === 0) return "0";
    const num = Number(value);
    if (num >= 1) return Math.round(num).toString();
    return num.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/assets", { credentials: "include", cache: "no-store" });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load balances");

      const data = await res.json();

      if (data.assets) {
        setBalances(data.assets);
      } else if (Array.isArray(data)) {
        const map = {};
        data.forEach((asset) => {
          const symbol = asset.symbol;
          const balance = Number(asset.balance || 0);
          map[symbol] = (map[symbol] || 0) + balance;
        });
        setBalances(map);
      } else {
        setBalances({});
      }
    } catch (err) {
      console.error("Error loading balances:", err);
      setBalances({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleCoinChange = (coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(networkOptions[coin][0]);
  };

  const handleMax = () => {
    const max = balances[selectedCoin] || 0;
    setAmount(max.toString());
  };

  const handleWithdraw = async () => {
    if (!amount || !withdrawAddress || !selectedNetwork) {
      alert("Please fill in all fields");
      return;
    }

    const available = balances[selectedCoin] || 0;
    if (Number(amount) > available) {
      alert(`Insufficient balance. Available: ${formatBalance(available)} ${selectedCoin}`);
      return;
    }

    const fee = externalWithdrawalFees[selectedCoin]?.[selectedNetwork] || 0;

    if (Number(amount) <= fee) {
      alert("Amount must be greater than the network fee");
      return;
    }

    const netAmount = Number(amount) - fee;

    try {
      const res = await fetch("/api/auth/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin: selectedCoin,
          network: selectedNetwork,
          amount: Number(amount),
          withdrawAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Withdrawal failed");
        return;
      }

      alert(
        `Withdrawal successful!\n` +
        `Requested: ${amount} ${selectedCoin}\n` +
        `Network Fee: ${fee} ${selectedCoin}\n` +
        `You will receive: ${netAmount.toFixed(8)} ${selectedCoin}`
      );

      setBalances(prev => ({
        ...prev,
        [selectedCoin]: prev[selectedCoin] - Number(amount),
      }));
      setAmount("");
      setWithdrawAddress("");
    } catch (err) {
      console.error("Withdrawal error:", err);
      alert("Server error, try again later");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-blue-950 to-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Withdraw Crypto</h2>
          <p className="text-gray-400 text-sm">Send funds to your external wallet instantly</p>
        </div>

        <div className="bg-gray-900/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 p-6 bg-linear-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-gray-700">
            {loading ? (
              <p className="text-gray-400 animate-pulse text-sm">Loading balance...</p>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Available Balance</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {formatBalance(balances[selectedCoin])}
                  </p>
                  <p className="text-xl text-gray-300 mt-1">{selectedCoin}</p>
                </div>
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-2xl"></div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-gray-300 text-xs font-medium mb-2">Select Coin</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(networkOptions).map((coin) => (
                <button
                  key={coin}
                  onClick={() => handleCoinChange(coin)}
                  className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg ${
                    selectedCoin === coin
                      ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/50"
                      : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-xs font-medium mb-1">Network</label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            >
              {networkOptions[selectedCoin].map((net) => (
                <option key={net} value={net} className="bg-gray-900 py-2">
                  {net} {net === "TRC20" ? "(Low Fee - Recommended)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-xs font-medium mb-1">Withdrawal Address</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="Paste wallet address here"
              className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-300 text-xs font-medium">Amount</label>
              <button
                onClick={handleMax}
                className="text-blue-400 hover:text-blue-300 font-medium transition text-xs"
              >
                Use Max
              </button>
            </div>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
            <div className="mt-4 text-sm text-gray-300">
              <p>Fee: {externalWithdrawalFees[selectedCoin]?.[selectedNetwork] || 0} {selectedCoin}</p>
              <p>
                You will receive:{" "}
                {amount
                  ? (Number(amount) - (externalWithdrawalFees[selectedCoin]?.[selectedNetwork] || 0)).toFixed(8)
                  : "0"}{" "}
                {selectedCoin}
              </p>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full py-4 bg-linear-to-r from-blue-600 via-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Confirm Withdrawal"}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Network fee will be deducted • Usually arrives in 1-30 minutes
          </p>
        </div>
      </div>
    </div>
  );
}