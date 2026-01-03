import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import FuturesAccount from "@/models/FuturesAccount";

async function getUserFromCookie(req) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    return await User.findById(decoded.id).lean();
  } catch {
    return null;
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const user = await getUserFromCookie(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { from, to, coin, amount } = await req.json();
    const amt = Number(amount);

    if (!from || !to || !coin || !amount) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    if (!["assets", "funding", "futures"].includes(from) || !["assets", "funding", "futures"].includes(to)) {
      return new Response(JSON.stringify({ error: "Invalid from/to type" }), { status: 400 });
    }

    if (from === to) {
      return new Response(JSON.stringify({ error: "Cannot transfer to same account" }), { status: 400 });
    }

    if (!Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), { status: 404 });
    }

    let futuresAccount = await FuturesAccount.findOne({ user: user._id });
    if (!futuresAccount) {
      futuresAccount = await FuturesAccount.create({
        user: user._id,
        balance: 0,
        marginUsed: 0,
        availableMargin: 0,
        equity: 0,
      });
    }

    if (from === "futures" || to === "futures") {
      if (coin !== "USDT") {
        return new Response(JSON.stringify({ error: "Futures account only supports USDT" }), { status: 400 });
      }
    }

    if (from === "assets" || to === "assets") {
      const assetsBalance = wallet.assets.get(coin) || 0;
      if (from === "assets" && assetsBalance < amt) {
        return new Response(JSON.stringify({ error: "Insufficient assets balance" }), { status: 400 });
      }
    }

    if (from === "funding" || to === "funding") {
      const fundingBalance = wallet.funding.get(coin) || 0;
      if (from === "funding" && fundingBalance < amt) {
        return new Response(JSON.stringify({ error: "Insufficient funding balance" }), { status: 400 });
      }
    }

    if (from === "futures" && futuresAccount.balance < amt) {
      return new Response(JSON.stringify({ error: "Insufficient futures balance" }), { status: 400 });
    }

    if (from === "assets" && to === "funding") {
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) - amt);
      wallet.funding.set(coin, (wallet.funding.get(coin) || 0) + amt);
    } else if (from === "funding" && to === "assets") {
      wallet.funding.set(coin, (wallet.funding.get(coin) || 0) - amt);
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) + amt);
    } else if (from === "funding" && to === "futures") {
      wallet.funding.set("USDT", wallet.funding.get("USDT") || 0 - amt);
      futuresAccount.balance += amt;
      futuresAccount.availableMargin += amt;
      futuresAccount.equity += amt;
    } else if (from === "futures" && to === "funding") {
      futuresAccount.balance -= amt;
      futuresAccount.availableMargin -= amt;
      futuresAccount.equity -= amt;
      wallet.funding.set("USDT", (wallet.funding.get("USDT") || 0) + amt);
    } else if (from === "assets" && to === "futures") {
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) - amt);
      futuresAccount.balance += amt;
      futuresAccount.availableMargin += amt;
      futuresAccount.equity += amt;
    } else if (from === "futures" && to === "assets") {
      futuresAccount.balance -= amt;
      futuresAccount.availableMargin -= amt;
      futuresAccount.equity -= amt;
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) + amt);
    }

    await wallet.save();
    await futuresAccount.save();

    return new Response(
      JSON.stringify({
        success: true,
        assets: Object.fromEntries(wallet.assets),
        funding: Object.fromEntries(wallet.funding),
        futures: {
          balance: futuresAccount.balance,
          availableMargin: futuresAccount.availableMargin,
          marginUsed: futuresAccount.marginUsed,
          equity: futuresAccount.equity,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Transfer API error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}