import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Wallet from "@/models/Wallet";

const COINS = ["USDT", "BTC", "ETH", "TRX", "BNB", "SOL", "ADA", "USDC"];

export async function GET(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    const empty = {};
    COINS.forEach(coin => empty[coin] = 0);
    return NextResponse.json({ funding: empty });
  }

  try {
    let wallet = await Wallet.findOne({ user: user._id }).lean();

    if (!wallet) {
      const empty = {};
      COINS.forEach(coin => empty[coin] = 0);

      wallet = await Wallet.create({
        user: user._id,
        assets: empty,
        funding: empty,
      });
      wallet = wallet.toObject();
    }
    const funding = wallet.funding instanceof Map 
      ? Object.fromEntries(wallet.funding) 
      : (wallet.funding || {});

    return NextResponse.json({ funding });
  } catch (err) {
    console.error('Funding fetch error:', err);
    return NextResponse.json({ funding: {} }, { status: 500 });
  }
}