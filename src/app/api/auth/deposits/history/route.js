import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CryptoDeposit from "@/models/CryptoDeposit"; 
import { getCurrentUser } from "@/lib/auth"; 

export async function GET(req) {
  await connectDB();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deposits = await CryptoDeposit.find({ user: user._id })
      .sort({ createdAt: -1 }) 
      .limit(100) 
      .select("coin network amount address txid status createdAt confirmations") 
      .lean(); 

    return NextResponse.json({ deposits }, { status: 200 });
  } catch (error) {
    console.error("Deposit history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load deposit history" },
      { status: 500 }
    );
  }
}