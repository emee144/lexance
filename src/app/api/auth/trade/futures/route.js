import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Wallet from "@/models/Wallet";
import FuturesPosition from "@/models/FuturesPosition";

export async function POST(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { side, price, quantity, leverage } = body;

    if (!side || !price || !quantity || !leverage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    side = side.toLowerCase();
    if (!["long", "short"].includes(side)) {
      return NextResponse.json({ error: "Invalid side: must be 'long' or 'short'" }, { status: 400 });
    }

    const priceNum = Number(price);
    const quantityNum = Number(quantity);
    const leverageNum = Number(leverage);

    if (isNaN(priceNum) || isNaN(quantityNum) || isNaN(leverageNum)) {
      return NextResponse.json({ error: "Invalid number format" }, { status: 400 });
    }

    if (leverageNum < 1 || leverageNum > 125) {
      return NextResponse.json({ error: "Leverage must be 1-125x" }, { status: 400 });
    }

    const notional = priceNum * quantityNum;
    const margin = notional / leverageNum;

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const cleanFunding = wallet.funding instanceof Map
      ? Object.fromEntries(wallet.funding)
      : wallet.funding;

    const usdtBalance = Number(cleanFunding.USDT || 0);

    if (usdtBalance < margin) {
      return NextResponse.json({ error: "Insufficient funding balance" }, { status: 400 });
    }

    cleanFunding.USDT = Number((usdtBalance - margin).toFixed(8));
    wallet.funding = cleanFunding;
    await wallet.save();

    const position = await FuturesPosition.create({
      user: user._id,
      side: side === "long" ? "long" : "short",
      leverage: leverageNum,
      entryPrice: priceNum,
      quantity: quantityNum,
      margin,
    });

    return NextResponse.json({
      success: true,
      message: `${side.toUpperCase()} position opened`,
      position: {
        side: position.side,
        leverage: position.leverage,
        entryPrice: position.entryPrice,
        quantity: position.quantity,
        margin: position.margin,
        notional: notional,
      },
    });
  } catch (err) {
    console.error("Futures trade error:", err);
    return NextResponse.json({ error: "Trade failed" }, { status: 500 });
  }
}