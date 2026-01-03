"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import CryptoDepositHistory from "@/components/CryptoDepositHistory";
export default function CryptoDepositPage({ selectedCoin: propCoin = "USDT", onBack }) {
  const [selectedCoin, setSelectedCoin] = useState(propCoin);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinFromUrl = urlParams.get("coin")?.toUpperCase();
    if (coinFromUrl) setSelectedCoin(coinFromUrl);
  }, []);

  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/deposits/address", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to load address");
        }

        const data = await res.json(); // flat array from backend
        console.log("Fetched addresses:", data);

        const coinNetworks = data.filter(item => item.coin === selectedCoin);
        setNetworks(coinNetworks);

        if (coinNetworks.length > 0) {
          setSelectedNetwork(coinNetworks[0].network);
          setAddress(coinNetworks[0].address);
        } else {
          setSelectedNetwork(null);
          setAddress("");
        }

      } catch (err) {
        console.error("Fetch address error:", err);
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    if (selectedCoin) fetchAddresses();
  }, [selectedCoin]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/auth/deposits/history", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch deposit history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();
  }, []);

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
    const selected = networks.find((n) => n.network === network);
    if (selected) setAddress(selected.address);
  };

  return (
    <div className="p-6 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mb-4"
        >
          ← Back to coin list
        </button>
      )}

      <div className="text-center">
        <Image
          src={`/${selectedCoin.toLowerCase()}.png`}
          alt={selectedCoin}
          width={80}
          height={80}
          className="mx-auto rounded-full mb-4"
        />
        <h2 className="text-3xl font-bold">Deposit {selectedCoin}</h2>
      </div>

      {loading && <p className="text-center text-gray-400">Loading addresses...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {networks.length > 0 && (
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {networks.map((n) => (
            <button
              key={n.network}
              onClick={() => handleNetworkChange(n.network)}
              className={`px-4 py-2 rounded-lg font-semibold border ${
                selectedNetwork === n.network
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              }`}
            >
              {n.network}
            </button>
          ))}
        </div>
      )}

      {selectedNetwork && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
            Only send <strong>{selectedCoin}</strong> via <strong>{selectedNetwork}</strong> network.<br />
            Wrong network = <strong>permanent loss of funds</strong>.
          </p>
        </div>
      )}

      {address && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="flex justify-center items-center mb-6">
            <QRCodeSVG value={address} size={200} fgColor="#2563EB" className="block" />
          </div>
          <p className="font-mono text-sm break-all bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg w-full max-w-md mx-auto mb-2">
            {address}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(address);
              alert("Address copied!");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Copy
          </button>
        </div>
      )}

      {!loading && !address && !error && (
        <p className="text-center text-red-500">No address found for {selectedCoin}</p>
      )}

      <CryptoDepositHistory />
    </div>
  );
}
