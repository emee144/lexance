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

    const positions = await FuturesPosition.find({
      user: user._id,
      status: "open",
    })
      .sort({ openedAt: -1 })
      .lean();

    return NextResponse.json({ positions });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
  }
}