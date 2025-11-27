"use client";
import { useState, useEffect } from "react";

export default function WithdrawForm() {
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  const networkOptions = {
    USDT: ["TRC20", "ERC20", "BEP20"],
    ETH: ["ERC20"],
    BTC: ["BTC", "BTC-Bech32"],
    BNB: ["BEP2", "BEP20"],
    TRX: ["TRC20"],
  };

 const fetchBalances = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("NO TOKEN FOUND");
      setBalances({});
      return;
    }

    const res = await fetch("/api/auth/assets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 REQUIRED
      },
    });

    if (!res.ok) {
      console.error("Auth failed:", res.status);
      setBalances({});
      return;
    }

    const data = await res.json();
    console.log("ASSETS RESPONSE:", data);

    const balanceMap = {};
    data.forEach(asset => {
      balanceMap[asset.symbol] = asset.balance;
    });

    setBalances(balanceMap);
    setSelectedNetwork(networkOptions[selectedCoin][0]);
  } catch (err) {
    console.error("Fetch failed:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchBalances();
  }, []);

  const handleCoinChange = (coin) => {
    setSelectedCoin(coin);
    const defaultNetwork = networkOptions[coin][0];
    setSelectedNetwork(defaultNetwork);
  };

  const handleWithdraw = () => {
    if (!withdrawAddress || !amount || !selectedNetwork) {
      alert("Please fill all fields.");
      return;
    }

    const availableBalance = balances[selectedCoin] || 0;
    if (parseFloat(amount) > availableBalance) {
      alert(`Insufficient balance. Your ${selectedCoin} balance is ${availableBalance}.`);
      return;
    }

    alert(
      `Withdrawing ${amount} ${selectedCoin} via ${selectedNetwork} to ${withdrawAddress}`
    );
    // Call your withdrawal API here
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h3>

      {loading ? (
        <p>Loading balances...</p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Available {selectedCoin} balance: {balances[selectedCoin] || 0}
        </p>
      )}

      {/* Coin Selection */}
      <div>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => handleCoinChange(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {Object.keys(networkOptions).map((coin) => (
            <option key={coin} value={coin}>
              {coin}
            </option>
          ))}
        </select>
      </div>

      {/* Network Selection */}
      <div>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Network</label>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {networkOptions[selectedCoin].map((network) => (
            <option key={network} value={network}>
              {network}
            </option>
          ))}
        </select>
      </div>

      {/* Withdrawal Address */}
      <div>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Withdrawal Address</label>
        <input
          type="text"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Enter withdrawal address"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={handleWithdraw}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
      >
        Withdraw
      </button>
    </div>
  );
}
