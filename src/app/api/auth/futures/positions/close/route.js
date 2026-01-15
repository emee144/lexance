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
      return NextResponse.json(
        { error: "Invalid positionId or exitPrice" },
        { status: 400 }
      );
    }

    const position = await FuturesPosition.findOne({
      _id: positionId,
      user: user._id,  
      status: "open",
    });

    if (!position) {
      return NextResponse.json(
        { error: "Open position not found" },
        { status: 404 }
      );
    }

    const pnl =
      position.side === "long"
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;

    const account = await FuturesAccount.findOne({ user: user._id });  

    if (!account) {
      return NextResponse.json(
        { error: "Futures account not found" },
        { status: 404 }
      );
    }

    const updatedAccount = await FuturesAccount.findOneAndUpdate(
      {
        _id: account._id,
        marginUsed: account.marginUsed,  
        balance: account.balance,
      },
      {
        $inc: {
          marginUsed: -position.margin,
          balance: pnl,  
        },
      },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json(
        { error: "Failed to update account (concurrent modification)" },
        { status: 409 }
      );
    }

    await FuturesPosition.findByIdAndUpdate(position._id, {
      status: "closed",
      realizedPnl: pnl,
      exitPrice: exitPrice,
      closedAt: new Date(),
      closeReason: "manual",
    });

    return NextResponse.json(
      {
        message: "Position closed successfully",
        realizedPnl: pnl.toFixed(2),
        account: {
          balance: updatedAccount.balance.toFixed(2),
          marginUsed: updatedAccount.marginUsed.toFixed(2),
          availableMargin: (updatedAccount.balance - updatedAccount.marginUsed).toFixed(2),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Close position error:", err);
    return NextResponse.json(
      { error: "Failed to close position" },
      { status: 500 }
    );
  }
}