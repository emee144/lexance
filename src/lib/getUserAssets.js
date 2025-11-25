// lib/getUserAssets.js
import { connectDB } from "@/lib/mongodb";
import DepositAddress from "@/models/DepositAddress";

/**
 * Fetches active deposit addresses for a user and enriches them with price data.
 * @param {string|import("mongoose").Types.ObjectId} userId
 */
export async function getUserAssets(userId) {
  await connectDB();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const addresses = await DepositAddress.find({
    user: userId,
    isActive: true,
    balance: { $gt: 0 },
  }).select("coin network address balance").lean();

  if (addresses.length === 0) {
    return [];
  }

  // Prices (unchanged)
  const priceRes = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tron,tether&vs_currencies=usd&include_24hr_change=true",
    { next: { revalidate: 60 } }
  );
  const prices = await priceRes.json();

  const assets = addresses.map((addr) => {
    const isUSDT = addr.coin === "USDT";
    const priceData = isUSDT
      ? prices.tether || { usd: 1, usd_24h_change: 0 }
      : prices[addr.coin.toLowerCase()] || { usd: 0, usd_24h_change: 0 };

    const balance = Number(addr.balance);
    const value = balance * priceData.usd;

    return {
      name: isUSDT ? "Tether" : addr.coin === "BTC" ? "Bitcoin" : addr.coin === "ETH" ? "Ethereum" : "TRON",
      symbol: isUSDT ? "USDT" : addr.coin,
      network: addr.network,
      balance: Number(balance.toFixed(8)),
      value: Number(value.toFixed(2)),
      price: Number(priceData.usd.toFixed(6)),
      change: Number((priceData.usd_24h_change || 0).toFixed(2)),
      address: addr.address,
      icon: `/icons/${addr.coin.toLowerCase()}.png`,
    };
  });

  assets.sort((a, b) => b.value - a.value);
  return assets;
}