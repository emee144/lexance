import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuturesAccount from "@/models/FuturesAccount";
import FuturesTransfer from "@/models/FuturesTransfer";
import { getCurrentUser } from "@/lib/auth";
import Wallet from "@/models/Wallet";

export async function POST(req) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { direction, amount, source } = await req.json();
  if (!["IN", "OUT"].includes(direction)) {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }
  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }
  let futuresAccount = await FuturesAccount.findOne({ user: user.id });
  if (!futuresAccount) {
    futuresAccount = await FuturesAccount.create({
      user: user.id,
      balance: 0,
      marginUsed: 0,
      equity: 0,
      marginAvailable: 0,
    });
  }
  const wallet = await Wallet.findOne({ user: user.id });
  if (!wallet) {
    return NextResponse.json({ error: "No main wallet found" }, { status: 400 });
  }
  if (direction === "IN") {
    if ((wallet[source] || 0) < amount) {
      return NextResponse.json({ error: "Insufficient balance in main wallet" }, { status: 400 });
    }
    wallet[source] -= amount;
    futuresAccount.balance += amount;
    futuresAccount.marginAvailable += amount;
  } else if (direction === "OUT") {
    if (futuresAccount.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance in futures account" }, { status: 400 });
    }
    futuresAccount.balance -= amount;
    futuresAccount.marginAvailable -= amount;
    wallet[source] = (wallet[source] || 0) + amount;
  }
  await wallet.save();
  await futuresAccount.save();
  const transfer = await FuturesTransfer.create({
    user: user.id,
    account: futuresAccount._id,
    direction,
    amount,
    source,
    reference: `FT-${Date.now()}`,
  });
  return NextResponse.json({ transfer, account: futuresAccount, wallet });
}