import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesPosition from "@/models/FuturesPosition";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await FuturesPosition.find({
      user: user._id,
      status: "closed",
    })
      .select(
        "pair side leverage quantity entryPrice exitPrice margin realizedPnl openedAt closedAt closeReason"
      )
      .sort({ closedAt: -1 })
      .lean();

    return NextResponse.json({ history }, { status: 200 });
  } catch (err) {
    console.error("Fetch trade history error:", err);
    return NextResponse.json(
      { error: "Failed to fetch trade history" },
      { status: 500 }
    );
  }
}