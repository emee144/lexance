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

    const {
      pair = "BTCUSDT",
      side,
      quantity,
      entryPrice,
      leverage = 20,
    } = await req.json();

    if (!["long", "short"].includes(side)) {
      return NextResponse.json({ error: "Invalid side" }, { status: 400 });
    }

    if (!quantity || quantity <= 0 || !entryPrice || entryPrice <= 0) {
      return NextResponse.json({ error: "Invalid quantity or price" }, { status: 400 });
    }

    if (leverage < 1 || leverage > 125) {
      return NextResponse.json({ error: "Invalid leverage" }, { status: 400 });
    }

    const marginRequired = (quantity * entryPrice) / leverage;

    let account = await FuturesAccount.findOne({ user: user._id });

    if (!account) {
      return NextResponse.json({ error: "No futures account. Transfer funds first." }, { status: 400 });
    }

    const availableMargin = account.balance - account.marginUsed;

    if (availableMargin < marginRequired) {
      return NextResponse.json(
        { error: `Insufficient margin. Required: ${marginRequired.toFixed(2)}, Available: ${availableMargin.toFixed(2)}` },
        { status: 400 }
      );
    }

    const updatedAccount = await FuturesAccount.findOneAndUpdate(
      {
        _id: account._id,
        balance: account.balance,
        marginUsed: account.marginUsed,
      },
      {
        $inc: { marginUsed: marginRequired },
      },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json(
        { error: "Margin changed. Please try again." },
        { status: 409 }
      );
    }

    const position = await FuturesPosition.create({
      user: user._id,
      pair,
      side,
      leverage,
      entryPrice,
      quantity,
      margin: marginRequired,
      status: "open",
      openedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Position opened successfully",
        position,
        account: {
          balance: updatedAccount.balance,
          marginUsed: updatedAccount.marginUsed,
          availableMargin: updatedAccount.balance - updatedAccount.marginUsed,
          equity: updatedAccount.equity || updatedAccount.balance,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Open position error:", err);
    return NextResponse.json(
      { error: "Failed to open position" },
      { status: 500 }
    );
  }
}