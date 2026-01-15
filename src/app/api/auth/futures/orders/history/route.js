import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesPosition from "@/models/FuturesPosition";
import FuturesOrder from "@/models/FuturesOrder";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const closedPositions = await FuturesPosition.find({
      user: user._id,
      status: "closed",
    }).sort({ closedAt: -1 });

    const filledOrders = await FuturesOrder.find({
      user: user._id,
      status: { $in: ["filled", "canceled"] },
    }).sort({ updatedAt: -1 });

    const history = [...closedPositions, ...filledOrders]
      .sort((a, b) => new Date(b.closedAt || b.updatedAt) - new Date(a.closedAt || a.updatedAt));

    return NextResponse.json({ history });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}