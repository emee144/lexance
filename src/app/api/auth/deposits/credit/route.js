import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import CryptoDeposit from "@/models/CryptoDeposit";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { txHash, userId, coin, network, amount, fromAddress } = body;

    if (!txHash || !userId || !coin || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const COIN = coin.toUpperCase().trim();
    const NETWORK = (network || "").toUpperCase().trim();

    // Prevent duplicate txHash
    const existing = await CryptoDeposit.findOne({ txHash });
    if (existing) {
      return NextResponse.json(
        { message: "Already credited", deposit: existing },
        { status: 200 }
      );
    }

    const deposit = new CryptoDeposit({
      user: userId,
      coin: COIN,
      network: NETWORK,
      amount,
      txHash,
      fromAddress,
      status: "completed",
    });

    await deposit.save();

    return NextResponse.json(
      { success: true, message: "Deposit credited", deposit },
      { status: 201 }
    );
  } catch (err) {
    console.error("Credit API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
