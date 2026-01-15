import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SpreadOrder from "@/models/SpreadOrder";
import Wallet from "@/models/Wallet";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pair, side, price, quantity } = await req.json();

  const wallet = await Wallet.findOne({ user: user._id });
  if (!wallet) return NextResponse.json({ error: "No wallet" });

  if (side === "bid") {
    const cost = price * quantity;
    if (wallet.funding < cost)
      return NextResponse.json({ error: "Insufficient USDT" }, { status: 400 });

    wallet.funding -= cost; 
  }

  if (side === "ask") {
    if ((wallet.assets.BTC || 0) < quantity)
      return NextResponse.json({ error: "Insufficient BTC" }, { status: 400 });

    wallet.assets.BTC -= quantity; 
  }

  await wallet.save();

  const order = await SpreadOrder.create({
    user: user._id,
    pair,
    side,
    price,
    quantity,
  });

  return NextResponse.json({ order }, { status: 201 });
}
