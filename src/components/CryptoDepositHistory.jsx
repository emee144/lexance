"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CryptoDepositHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/deposits", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to load deposit history");

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching deposit history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatAmount = (amount) =>
    Number(amount)
      .toFixed(8)
      .replace(/0+$/, "")
      .replace(/\.$/, "");

  return (
    <div className="w-full bg-gray-900/90 rounded-xl shadow-lg overflow-x-auto">
      <h3 className="text-white font-semibold mb-2 text-sm">Deposit History</h3>

      {loading ? (
        <p className="text-gray-400 text-xs animate-pulse">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-400 text-xs text-center">No deposits yet.</p>
      ) : (
        <table className="table-auto text-left text-xs border-collapse w-full">
          <thead>
            <tr className="text-gray-400 uppercase border-b border-gray-700">
              <th className="px-1 py-0.5">Coin</th>
              <th className="px-1 py-0.5">Network</th>
              <th className="px-1 py-0.5">Amount</th>
              <th className="px-1 py-0.5">Address</th> {/* NEW COLUMN */}
              <th className="px-1 py-0.5">From Address</th>
              <th className="px-1 py-0.5">Status</th>
              <th className="px-1 py-0.5">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((d) => (
              <tr
                key={d._id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-1 py-0.5 text-white font-semibold">{d.coin}</td>
                <td className="px-1 py-0.5 text-gray-300">{d.network}</td>
                <td className="px-1 py-0.5 text-gray-300">{formatAmount(d.amount)}</td>

                {/* NEW: deposit address field */}
                <td
                  className="px-1 py-0.5 text-gray-300 truncate max-w-[200px]"
                  title={d.address}
                >
                  {d.address}
                </td>

                <td
                  className="px-1 py-0.5 text-gray-300 truncate max-w-[200px]"
                  title={d.fromAddress}
                >
                  {d.fromAddress}
                </td>
                <td
                  className={`px-1 py-0.5 font-semibold ${
                    d.status === "pending"
                      ? "text-yellow-400"
                      : d.status === "completed"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {d.status}
                </td>
                <td className="px-1 py-0.5 text-gray-400 text-xs">
                  {new Date(d.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-2 text-right"></div>
    </div>
  );
}
