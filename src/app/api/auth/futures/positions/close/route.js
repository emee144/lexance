import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesAccount from "@/models/FuturesAccount";
import FuturesPosition from "@/models/FuturesPosition";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { positionId, exitPrice } = await req.json();

    if (!positionId || !exitPrice || exitPrice <= 0) {
      return NextResponse.json({ error: "Invalid positionId or exitPrice" }, { status: 400 });
    }

    const position = await FuturesPosition.findOne({
      _id: positionId,
      user: user.id,
      status: "open",
    });

    if (!position) {
      return NextResponse.json({ error: "Open position not found" }, { status: 404 });
    }

    const pnl =
      position.side === "long"
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;

    const account = await FuturesAccount.findById(position.account);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updatedAccount = await FuturesAccount.findOneAndUpdate(
      { _id: account._id, marginUsed: { $gte: position.margin } },
      {
        $inc: {
          marginUsed: -position.margin,
          balance: position.margin + pnl,
          availableMargin: position.margin + pnl,
        },
      },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: "Failed to release margin" }, { status: 500 });
    }

    position.status = "closed";
    position.realizedPnl = pnl;
    position.exitPrice = exitPrice;
    position.closedAt = new Date();
    position.closeReason = "manual";

    await position.save();

    return NextResponse.json(
      { message: "Position closed successfully", position, pnl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error closing position:", error);
    return NextResponse.json({ error: "Failed to close position" }, { status: 500 });
  }
}