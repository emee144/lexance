import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesAccount from "@/models/FuturesAccount";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await FuturesAccount.findOne({ user: user.id });

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
        balance: account.balance ?? 0,
        marginUsed: account.marginUsed ?? 0,
        equity: account.equity ?? account.balance ?? 0,
        availableMargin: account.availableMargin ?? account.balance ?? 0,
        unrealizedPnl: account.unrealizedPnl ?? 0,
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