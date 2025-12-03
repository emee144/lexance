"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function WithdrawalHistoryCompact() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/withdrawals", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to load withdrawal history");

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching withdrawal history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatAmount = (amount) =>
    Number(amount).toFixed(8).replace(/0+$/, "").replace(/\.$/, "");

  // Show only the last 5 withdrawals for compact view
  const recentHistory = history.slice(-5).reverse();

  return (
<table className="w-full text-left text-xs mb-5 border-collapse border-r-2">
  <thead>
    <tr className="text-gray-400 uppercase border-b border-gray-700">
      <th className="px-1 py-0.5 ">Coin</th>
      <th className="px-1 py-0.5">Network</th>
      <th className="px-1 py-0.5">Amount</th>
      <th className="px-1 py-0.5">Fee</th>
      <th className="px-1 py-0.5">Net</th>
      <th className="px-1 py-0.5 w-[180px]">Address</th> {/* fixed width */}
      <th className="px-1 py-0.5 w-20">Status</th>   {/* fixed width */}
    </tr>
  </thead>
  <tbody>
    {recentHistory.map((w) => (
      <tr
        key={w._id}
        className="border-b border-gray-800 hover:bg-gray-800/50"
      >
        <td className="px-1 py-0.5 text-white font-semibold">{w.coin}</td>
        <td className="px-1 py-0.5 text-gray-300">{w.network}</td>
        <td className="px-1 py-0.5 text-gray-300">{formatAmount(w.amount)}</td>
        <td className="px-1 py-0.5 text-gray-300">{formatAmount(w.fee)}</td>
        <td className="px-1 py-0.5 text-gray-300">{formatAmount(w.netAmount)}</td>
        <td className="px-1 py-0.5 text-gray-300 truncate" title={w.withdrawAddress}>
          {w.withdrawAddress}
        </td>
        <td
          className={`px-1 py-0.5 font-semibold ${
            w.status === "pending"
              ? "text-yellow-400"
              : w.status === "completed"
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {w.status}
        </td>
      </tr>
    ))}
  </tbody>
</table>

  );
}
