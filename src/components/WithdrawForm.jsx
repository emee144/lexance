"use client";
import { useState } from "react";

export default function WithdrawForm() {
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  // Define network options per coin
  const networkOptions = {
    USDT: ["TRC20", "ERC20", "BEP20"],
    ETH: ["ERC20"],
    BTC: ["BTC", "BTC-Bech32"],
    BNB: ["BEP2", "BEP20"],
  };

  // Update network when coin changes
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
    alert(
      `Withdrawing ${amount} ${selectedCoin} via ${selectedNetwork} to ${withdrawAddress}`
    );
    // Call your API here
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h3>

      {/* Coin Selection */}
      <div>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => handleCoinChange(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="BNB">BNB</option>
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
