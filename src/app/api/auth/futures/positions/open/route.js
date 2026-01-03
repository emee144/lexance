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

    const body = await req.json();

    const {
      pair = "BTCUSDT",
      side,
      quantity,
      entryPrice,
      leverage = 20,
    } = body;

    if (!side || !["long", "short"].includes(side)) {
      return NextResponse.json({ error: "Invalid side: must be 'long' or 'short'" }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    if (!entryPrice || entryPrice <= 0) {
      return NextResponse.json({ error: "Entry price must be a positive number" }, { status: 400 });
    }

    if (leverage < 1 || leverage > 125) {
      return NextResponse.json({ error: "Leverage must be between 1 and 125" }, { status: 400 });
    }

    const margin = (quantity * entryPrice) / leverage;

    const account = await FuturesAccount.findOne({ user: user.id });

    if (!account) {
      return NextResponse.json({ error: "No futures account found" }, { status: 400 });
    }

    if (account.availableMargin < margin) {
      return NextResponse.json({ error: "Insufficient available margin" }, { status: 400 });
    }

    const updatedAccount = await FuturesAccount.findOneAndUpdate(
      { _id: account._id, availableMargin: { $gte: margin } },
      {
        $inc: {
          marginUsed: margin,
          availableMargin: -margin,
        },
      },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: "Insufficient margin - please try again" }, { status: 400 });
    }

    const position = await FuturesPosition.create({
      user: user.id,
      account: account._id,
      pair,
      side,
      leverage,
      entryPrice,
      quantity,
      margin,
      status: "open",
      openedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Position opened successfully", position },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error opening position:", error);
    return NextResponse.json(
      { error: "Failed to open position" },
      { status: 500 }
    );
  }
}