// app/api/auth/deposit/credit/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CryptoDeposit from "@/models/CryptoDeposit";
import { getCurrentUser } from "@/lib/auth"; // optional auth

export async function POST(request) {
  try {
    await connectDB();

    // Optional: restrict to admin or internal service
    // const user = await getCurrentUser();
    // if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      txHash,
      userId,
      coin,
      network,
      amount,
      fromAddress,
    } = body;

    // Validation
    if (!txHash || !userId || !coin || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // Normalize before anything
    const COIN = coin.toUpperCase().trim();
    const NETWORK = (network || "").toUpperCase().trim();

    // Prevent duplicate processing
    const existing = await CryptoDeposit.findOne({ txHash });
    if (existing) {
      if (existing.credited) {
        return NextResponse.json(
          { message: "Already credited", deposit: existing },
          { status: 200 }
        );
      }

      // Update existing pending deposit
      existing.amount = amount;
      existing.fromAddress = fromAddress || existing.fromAddress;
      existing.status = "completed";  // ← triggers pre-save hook
      await existing.save();

      return NextResponse.json(
        { success: true, message: "Updated & credited", deposit: existing },
        { status: 200 }
      );
    }

    // Create new deposit
    const deposit = new CryptoDeposit({
      user: userId,
      coin: COIN,
      network: NETWORK,
      amount,
      txHash,
      fromAddress,
      status: "completed",   // ← this triggers the magic
    });

    await deposit.save(); // pre-save hook credits everything atomically

    return NextResponse.json(
      {
        success: true,
        message: "Deposit created and credited",
        deposit,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Credit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}