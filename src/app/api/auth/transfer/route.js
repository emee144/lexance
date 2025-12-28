import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

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

    if (!["assets", "funding"].includes(from) || !["assets", "funding"].includes(to)) {
      return new Response(JSON.stringify({ error: "Invalid wallet type" }), { status: 400 });
    }

    if (from === to) {
      return new Response(JSON.stringify({ error: "Cannot transfer to same wallet" }), { status: 400 });
    }

    if (!Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), { status: 404 });
    }

    const fromBalance =
      from === "assets"
        ? wallet.assets.get(coin) || 0
        : wallet.funding.get(coin) || 0;

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
        success: true,
        assets: Object.fromEntries(wallet.assets),
        funding: Object.fromEntries(wallet.funding),
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Transfer API error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
