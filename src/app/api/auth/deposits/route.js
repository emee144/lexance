import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import CryptoDeposit from "@/models/CryptoDeposit";
import DepositAddress from "@/models/DepositAddress"; 

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Step 1: Get all deposits
    const deposits = await CryptoDeposit.find({ user: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    // Step 2: Find the user's USDT-TRC20 deposit address (you probably have only one per user/network)
    const addressDoc = await DepositAddress.findOne({
      user: decoded.id,
      coin: "USDT",
      network: "TRC20"
    }).lean();

    const userTrc20Address = addressDoc?.address || "—";

    // Step 3: Attach the address to every deposit (for this coin/network)
    const depositsWithAddress = deposits.map(deposit => ({
      ...deposit,
      // Only show the real address for USDT-TRC20 deposits
      address: (deposit.coin === "USDT" && deposit.network === "TRC20") 
        ? userTrc20Address 
        : deposit.address || "—"
    }));

    return NextResponse.json(depositsWithAddress);

  } catch (error) {
    console.error("Deposit history error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}