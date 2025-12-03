import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import CryptoDeposit from "@/models/CryptoDeposit";

export async function GET(req) {
  try {
    await connectDB();

    // CORRECT COOKIE NAME
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const deposits = await CryptoDeposit.find({ user: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(deposits);

  } catch (error) {
    console.error("Deposit history error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}