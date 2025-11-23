// app/deposit/address/route.js   ← FINAL WORKING VERSION
import { NextResponse } from "next/server";
import DepositAddress from "@/models/DepositAddress";
import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function getUserFromToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { _id: payload.id };
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await DepositAddress.find({
      user: user._id,
      // isActive: true,  
    })
      .select("coin network address memo")  
      .sort({ coin: 1, network: 1 })
      .lean();

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Deposit address fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}