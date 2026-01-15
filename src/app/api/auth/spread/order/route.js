import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SpreadOrder from "@/models/SpreadOrder";
import Wallet from "@/models/Wallet";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pair, side, price, quantity } = await req.json();

  if (!pair || !side || !price || !quantity) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (price <= 0 || quantity <= 0) {
    return NextResponse.json({ error: "Invalid price or quantity" }, { status: 400 });
  }

  const wallet = await Wallet.findOne({ user: user._id });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  if (side === "bid") {
    const cost = price * quantity;
    if (wallet.funding < cost) {
      return NextResponse.json({ error: "Insufficient USDT" }, { status: 400 });
    }
    wallet.funding -= cost;
  }

  if (side === "ask") {
    const base = pair.replace("USDT", "");
    if ((wallet.assets?.[base] || 0) < quantity) {
      return NextResponse.json({ error: `Insufficient ${base}` }, { status: 400 });
    }
    wallet.assets[base] -= quantity;
  }

  await wallet.save();

  const order = await SpreadOrder.create({
    user: user._id,
    pair,
    side,
    price,
    quantity,
    filledQuantity: 0,
    status: "open",
  });

  return NextResponse.json({ order }, { status: 201 });
}
