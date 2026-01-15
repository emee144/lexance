import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesOrder from "@/models/FuturesOrder"; 
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await FuturesOrder.find({
      user: user._id,
      status: { $in: ["open", "partial"] },
    }).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch open orders" }, { status: 500 });
  }
}