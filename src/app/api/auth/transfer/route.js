import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import DepositAddress from "@/models/DepositAddress";

async function getUserFromCookie(req) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    const user = await User.findById(decoded.id).lean();
    return user || null;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const user = await getUserFromCookie(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const { from, to, coin, amount } = body;
    const amt = parseFloat(amount);

    if (!from || !to || !coin || !amount) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    if (from === to) {
      return new Response(JSON.stringify({ error: "Cannot transfer to same account" }), { status: 400 });
    }
    if (isNaN(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      const init = {};
      ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA"].forEach(c => { init[c] = 0; });
      wallet = await Wallet.create({
        user: user._id,
        assets: init,
        funding: init,
      });
    }
    const deposits = await DepositAddress.find({
      user: user._id,
      coin,
      isActive: true,
    }).lean();

    let totalDeposited = 0;
    for (const dep of deposits) {
      totalDeposited += dep.balance || 0;
    }
    const currentAssets = wallet.assets.get(coin) || 0;
    if (totalDeposited > currentAssets) {
      wallet.assets.set(coin, totalDeposited);
    }
    const fromBalance = (from === "assets" ? wallet.assets.get(coin) : wallet.funding.get(coin)) || 0;
    if (fromBalance < amt) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
    }
    if (from === "assets") {
      wallet.assets.set(coin, fromBalance - amt);
      wallet.funding.set(coin, (wallet.funding.get(coin) || 0) + amt);
    } else {
      wallet.funding.set(coin, fromBalance - amt);
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) + amt);
    }

    await wallet.save();

    return new Response(
      JSON.stringify({
        message: "Transfer successful",
        assets: Object.fromEntries(wallet.assets),
        funding: Object.fromEntries(wallet.funding),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Transfer API error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}