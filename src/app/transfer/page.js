"use client";
import { useState, useEffect } from "react";

const coins = ["USDT", "BTC", "ETH", "TRX", "BNB", "SOL", "ADA", "USDC"];

export default function TransferPage() {
  const [from, setFrom] = useState("assets");
  const [to, setTo] = useState("funding");
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState({
    assets: {},
    funding: {},
    futures: { USDT: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  const fetchBalances = async () => {
    try {
      setLoading(true);

      const [assetsRes, fundingRes, futuresRes] = await Promise.all([
        fetch("/api/auth/assets", { cache: "no-store" }),
        fetch("/api/auth/funding", { cache: "no-store" }),
        fetch("/api/auth/futures/account", { cache: "no-store" }),
      ]);

      const assetsData = assetsRes.ok ? await assetsRes.json() : {};
      const fundingData = fundingRes.ok ? await fundingRes.json() : {};
      const futuresData = futuresRes.ok ? await futuresRes.json() : { account: null };

      const assetsMap = assetsData.assets || assetsData || {};
      const fundingMap = fundingData.funding || fundingData || {};
      const futuresBalance = futuresData.account?.balance || 0;

      setBalances({
        assets: assetsMap,
        funding: fundingMap,
        futures: { USDT: futuresBalance },
      });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

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
      await fetchBalances();
    } catch (err) {
      console.error(err);
      alert(err.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  const getBalance = () => {
    if (from === "assets") return balances.assets[coin] || 0;
    if (from === "funding") return balances.funding[coin] || 0;
    if (from === "futures") return balances.futures.USDT || 0;
    return 0;
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
                <option value="assets">Assets</option>
                <option value="funding">Funding</option>
                <option value="futures">Futures (USDT only)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-6 py-4"
              >
                <option value="funding">Funding</option>
                <option value="assets">Assets</option>
                <option value="futures">Futures (USDT only)</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-400 mb-2">
              Coin {loading ? "" : `- Available: ${getBalance().toFixed(4)}`}
            </label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              disabled={from === "futures" || to === "futures"}
              className="w-full bg-gray-800 rounded-xl px-6 py-4 disabled:opacity-50"
            >
              {(from === "futures" || to === "futures" ? ["USDT"] : coins).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {from === "futures" || to === "futures" ? (
              <p className="text-sm text-gray-500 mt-2">Futures transfers only support USDT</p>
            ) : null}
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
            disabled={transferring || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-5 rounded-2xl text-xl font-bold hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
          >
            {transferring ? "Transferring..." : "Confirm Transfer (0 fee · Instant)"}
          </button>

          {loading && <p className="text-center text-gray-400 mt-4">Loading balances...</p>}
        </div>
      </div>
    </div>
  );
}