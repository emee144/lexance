import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Wallet from "@/models/Wallet";
import Order from "@/models/Order";

export async function POST(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { side, price, quantity: qtyStr } = body;

    if (!side || !price || !qtyStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    side = side.toLowerCase();
    if (!["buy", "sell"].includes(side)) {
      return NextResponse.json({ error: "Invalid side" }, { status: 400 });
    }

    const priceNum = Number(price);
    const quantityNum = Number(qtyStr);

    if (isNaN(priceNum) || isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ error: "Invalid price or quantity" }, { status: 400 });
    }

    const total = Number((priceNum * quantityNum).toFixed(2));

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const cleanAssets = wallet.assets instanceof Map
      ? Object.fromEntries(wallet.assets)
      : wallet.assets;

    const usdtBalance = Number(cleanAssets.USDT || 0);
    const btcBalance = Number(cleanAssets.BTC || 0);

    if (side === "buy") {
      if (usdtBalance < total) {
        return NextResponse.json({ error: "Insufficient USDT" }, { status: 400 });
      }
      cleanAssets.USDT = Number((usdtBalance - total).toFixed(8));
      cleanAssets.BTC = Number((btcBalance + quantityNum).toFixed(8));
    } else {
      if (btcBalance < quantityNum) {
        return NextResponse.json({ error: "Insufficient BTC" }, { status: 400 });
      }
      cleanAssets.BTC = Number((btcBalance - quantityNum).toFixed(8));
      cleanAssets.USDT = Number((usdtBalance + total).toFixed(8));
    }

    wallet.assets = cleanAssets;
    await wallet.save();

    const order = await Order.create({
      user: user._id,
      pair: "BTC/USDT",
      side,
      price: priceNum,
      quantity: quantityNum,
      total,
      status: "filled",
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Trade error:", err);
    return NextResponse.json({ error: "Trade failed" }, { status: 500 });
  }
}