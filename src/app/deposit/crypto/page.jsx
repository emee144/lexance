"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

export default function CryptoDepositPage({ selectedCoin: propCoin = "USDT", onBack }) {
  const [selectedCoin, setSelectedCoin] = useState(propCoin);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read coin from URL if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinFromUrl = urlParams.get("coin")?.toUpperCase();
    if (coinFromUrl) setSelectedCoin(coinFromUrl);
  }, []);

  // Fetch deposit addresses whenever coin changes
  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const res = await fetch(`${window.location.origin}/api/auth/deposit/address`, {
          "Content-Type": "application/json",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError(`Failed to fetch deposit addresses: ${res.status}`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const coinAddresses = data.filter((d) => d.coin === selectedCoin);

        setNetworks(coinAddresses);

        if (coinAddresses.length > 0) {
          setSelectedNetwork(coinAddresses[0].network);
          setAddress(coinAddresses[0].address);
        } else {
          setSelectedNetwork(null);
          setAddress("");
        }
      } catch (err) {
        console.error(err);
        setError("Network error while fetching addresses");
      }
      setLoading(false);
    }

    fetchAddresses();
  }, [selectedCoin]);

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

      {/* Network selection */}
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

      {/* Warning */}
      {selectedNetwork && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
            Only send <strong>{selectedCoin}</strong> via <strong>{selectedNetwork}</strong> network.<br />
            Wrong network = <strong>permanent loss of funds</strong>.
          </p>
        </div>
      )}

      {/* QR + Address */}
      {address && (
<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
  {/* Centering QR Code */}
  <div className="flex justify-center items-center mb-6">
    <QRCodeSVG
      value={address}
      size={200}
      fgColor="#2563EB"
      className="block"
    />
  </div>

  {/* Address text */}
  <p className="font-mono text-sm break-all bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg w-full max-w-md mx-auto mb-2">
    {address}
  </p>

  {/* Copy button below address */}
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
    </div>
  );
}
