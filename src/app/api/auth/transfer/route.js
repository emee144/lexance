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

    return await User.findById(decoded.id);
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

    if (!from || !to || !coin || !Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }

    const TYPES = ["assets", "funding", "futures"];
    if (!TYPES.includes(from) || !TYPES.includes(to) || from === to) {
      return new Response(JSON.stringify({ error: "Invalid transfer type" }), { status: 400 });
    }

    if ((from === "futures" || to === "futures") && coin !== "USDT") {
      return new Response(
        JSON.stringify({ error: "Futures transfers only support USDT" }),
        { status: 400 }
      );
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
        equity: 0,
      });
    }

    if (from === "assets") {
      if ((wallet.assets.get(coin) || 0) < amt) {
        return new Response(JSON.stringify({ error: "Insufficient assets balance" }), { status: 400 });
      }
    }

    if (from === "funding") {
      if ((wallet.funding.get(coin) || 0) < amt) {
        return new Response(JSON.stringify({ error: "Insufficient funding balance" }), { status: 400 });
      }
    }

    if (from === "futures") {
      if (futuresAccount.balance - futuresAccount.marginUsed < amt) {
        return new Response(
          JSON.stringify({ error: "Insufficient available futures margin" }),
          { status: 400 }
        );
      }
    }

    if (from === "assets" && to === "funding") {
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) - amt);
      wallet.funding.set(coin, (wallet.funding.get(coin) || 0) + amt);
    }

    else if (from === "funding" && to === "assets") {
      wallet.funding.set(coin, (wallet.funding.get(coin) || 0) - amt);
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) + amt);
    }

    else if (from === "assets" && to === "futures") {
      wallet.assets.set(coin, (wallet.assets.get(coin) || 0) - amt);
      futuresAccount.balance += amt;
      futuresAccount.equity += amt;
    }

    else if (from === "funding" && to === "futures") {
      wallet.funding.set("USDT", (wallet.funding.get("USDT") || 0) - amt);
      futuresAccount.balance += amt;
      futuresAccount.equity += amt;
    }

    else if (from === "futures" && to === "assets") {
      futuresAccount.balance -= amt;
      futuresAccount.equity -= amt;
      wallet.assets.set("USDT", (wallet.assets.get("USDT") || 0) + amt);
    }

    else if (from === "futures" && to === "funding") {
      futuresAccount.balance -= amt;
      futuresAccount.equity -= amt;
      wallet.funding.set("USDT", (wallet.funding.get("USDT") || 0) + amt);
    }

    futuresAccount.lastUpdatedAt = new Date();

    await wallet.save();
    await futuresAccount.save();

    return new Response(
      JSON.stringify({
        success: true,
        assets: Object.fromEntries(wallet.assets),
        funding: Object.fromEntries(wallet.funding),
        futures: {
          balance: futuresAccount.balance,
          marginUsed: futuresAccount.marginUsed,
          marginAvailable: futuresAccount.marginAvailable,
          equity: futuresAccount.equity,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Transfer error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
