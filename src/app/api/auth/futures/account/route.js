import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesAccount from "@/models/FuturesAccount";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await FuturesAccount.findOne({ user: user._id });

    if (!account) {
      return NextResponse.json({
        account: {
          balance: 0,
          marginUsed: 0,
          equity: 0,
          availableMargin: 0,
          unrealizedPnl: 0,
        },
      });
    }

    return NextResponse.json({
      account: {
        balance: Number(account.balance) || 0,
        marginUsed: Number(account.marginUsed) || 0,
        equity: Number(account.equity) || Number(account.balance) || 0,
        availableMargin: Number(account.availableMargin) || Number(account.balance) || 0,
        unrealizedPnl: Number(account.unrealizedPnl) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching futures account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}