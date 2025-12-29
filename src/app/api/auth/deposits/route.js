export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import CryptoDeposit from "@/models/CryptoDeposit";
import DepositAddress from "@/models/DepositAddress"; 
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const deposits = await CryptoDeposit.find({ user: decoded.id })
      .sort({ createdAt: -1 })
      .lean();
    const addressDoc = await DepositAddress.findOne({
      user: decoded.id,
      coin: "USDT",
      network: "TRC20"
    }).lean();

    const userTrc20Address = addressDoc?.address || "—";

    const depositsWithAddress = deposits.map(deposit => ({
      ...deposit,
     
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