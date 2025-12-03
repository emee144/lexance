import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import DepositAddress from "@/models/DepositAddress";

// ------------------ Get user from access_token cookie ------------------
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
    // ------------------ AUTH ------------------
    const user = await getUserFromCookie(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------ PARSE BODY ------------------
    let body;
    try {
      body = await req.json();
      console.log("Body received:", body);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { from, to, coin, amount } = body || {};
    const amt = parseFloat(amount);

    if (!from || !to || !coin || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (from === to) {
      return new Response(
        JSON.stringify({ error: "From and To cannot be the same" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isNaN(amt) || amt <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------ GET OR CREATE WALLET ------------------
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      // Initialize empty wallet with all coins 0
      const initAssets = {};
      const initFunding = {};
      ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA"].forEach((c) => {
        initAssets[c] = 0;
        initFunding[c] = 0;
      });

      wallet = await Wallet.create({
        user: user._id,
        assets: initAssets,
        funding: initFunding,
      });
    }

    // ------------------ SYNC ASSETS WITH DEPOSIT ------------------
    const deposit = await DepositAddress.findOne({
      user: user._id,
      coin,
      isActive: true,
    });

    if (deposit) {
      // Only update wallet assets for this coin if it's less than deposit
      const currentAssets = wallet.assets.get(coin) || 0;
      if (currentAssets < deposit.balance) {
        wallet.assets.set(coin, deposit.balance);
      }
    }

    // ------------------ VALIDATE BALANCE ------------------
    const fromBalance = wallet[from].get(coin) || 0;
    if (fromBalance < amt) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------ PERFORM TRANSFER ------------------
    wallet[from].set(coin, fromBalance - amt);
    const toBalance = wallet[to].get(coin) || 0;
    wallet[to].set(coin, toBalance + amt);

    await wallet.save();

    // ------------------ RETURN BALANCES ------------------
    const depositBalances = await DepositAddress.find({
      user: user._id,
      coin,
      isActive: true,
    })
      .select("coin network address balance")
      .lean();

    return new Response(
      JSON.stringify({
        message: "Transfer successful",
        walletBalances: {
          assets: Object.fromEntries(wallet.assets),
          funding: Object.fromEntries(wallet.funding),
        },
        depositBalances,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Transfer API error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
