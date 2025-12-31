import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Wallet from "@/models/Wallet";

const COINS = ["USDT", "BTC", "ETH", "TRX", "BNB", "SOL", "ADA"];

export async function GET(request) {
  await connectDB();

  const user = await getCurrentUser(request);

  if (!user) {
    const empty = {};
    COINS.forEach(coin => (empty[coin] = 0));
    return NextResponse.json({ assets: empty });
  }

  try {
    let wallet = await Wallet.findOne({ user: user._id }).lean();

    if (!wallet) {
      const empty = {};
      COINS.forEach(coin => (empty[coin] = 0));

      wallet = await Wallet.create({
        user: user._id,
        assets: empty,
        funding: empty,
      });
      wallet = wallet.toObject();
    }

    const cleanAssets = wallet.assets instanceof Map
      ? Object.fromEntries(wallet.assets)
      : (wallet.assets || {});

    const assets = {};
    COINS.forEach(coin => {
      assets[coin] = Number(cleanAssets[coin] || 0);
    });

    return NextResponse.json({ assets });
  } catch (err) {
    console.error("Assets fetch error:", err);
    return NextResponse.json({ assets: {} }, { status: 500 });
  }
}