"use client";
import { useState, useEffect } from "react";

const coins = ["USDT", "BTC", "ETH", "TRX"];

export default function TransferPage() {
  const [from, setFrom] = useState("assets");
  const [to, setTo] = useState("funding");
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/assets", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch balances");
      const data = await res.json();

      const map = {};
      data.forEach((b) => {
        map[b.symbol] = b.balance;
      });
      setBalances(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  // Handle transfer
  const handleTransfer = async () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      alert("Enter a valid positive amount");
      return;
    }

    setTransferring(true);

    try {
      const payload = { from, to, coin, amount: amt };
      console.log("Sending transfer:", payload);

      const res = await fetch("/api/auth/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data;
      try { data = await res.json(); } 
      catch { data = { error: "Invalid response from server" }; }

      if (!res.ok) throw new Error(data.error || "Transfer failed");

      alert("Transfer successful!");
      setAmount("");
      fetchBalances();
    } catch (err) {
      console.error(err);
      alert(err.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-12">Internal Transfer</h1>
        <div className="bg-gray-900 rounded-3xl p-10">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-400 mb-2">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-6 py-4"
              >
                <option value="assets">Assets / Wallet</option>
                <option value="funding">Funding Account</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-6 py-4"
              >
                <option value="funding">Funding Account</option>
                <option value="assets">Assets / Wallet</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-400 mb-2">Coin</label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-6 py-4"
            >
              {coins.map((c) => (
                <option key={c} value={c}>
                  {c} {balances[c] !== undefined && `- Balance: ${balances[c]}`}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full bg-gray-800 rounded-xl px-6 py-4 text-xl mb-8"
          />

          <button
            onClick={handleTransfer}
            disabled={transferring}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 py-5 rounded-2xl text-xl font-bold hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
          >
            {transferring ? "Transferring..." : "Confirm Transfer (0 fee · Instant)"}
          </button>

          {loading && <p className="text-center text-gray-400 mt-4">Loading balances...</p>}
        </div>
      </div>
    </div>
  );
}
