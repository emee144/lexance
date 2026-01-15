import { connectDB } from "@/lib/mongodb";
import SpreadOrder from "@/models/SpreadOrder";
import Wallet from "@/models/Wallet";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { pair } = await req.json();
    const baseAsset = pair.replace("USDT", "");

    const bid = await SpreadOrder.findOne({
      pair,
      side: "bid",
      status: { $in: ["open", "partial"] },
    })
      .sort({ price: -1, createdAt: 1 })
      .session(session);

    const ask = await SpreadOrder.findOne({
      pair,
      side: "ask",
      status: { $in: ["open", "partial"] },
    })
      .sort({ price: 1, createdAt: 1 })
      .session(session);

    if (!bid || !ask) {
      await session.abortTransaction();
      return new Response("no orders");
    }

    if (bid.price < ask.price) {
      await session.abortTransaction();
      return new Response("spread intact");
    }

    const bidRemaining = bid.quantity - bid.filledQuantity;
    const askRemaining = ask.quantity - ask.filledQuantity;

    const tradeQty = Math.min(bidRemaining, askRemaining);
    const tradePrice = ask.price;

    const buyerWallet = await Wallet.findOne({ user: bid.user }).session(session);
    const sellerWallet = await Wallet.findOne({ user: ask.user }).session(session);

    if (!buyerWallet || !sellerWallet) {
      throw new Error("wallet not found");
    }

    buyerWallet.assets[baseAsset] =
      (buyerWallet.assets[baseAsset] || 0) + tradeQty;

    sellerWallet.funding += tradeQty * tradePrice;

    bid.filledQuantity += tradeQty;
    ask.filledQuantity += tradeQty;

    bid.status =
      bid.filledQuantity === bid.quantity ? "filled" : "partial";

    ask.status =
      ask.filledQuantity === ask.quantity ? "filled" : "partial";

    await Promise.all([
      buyerWallet.save({ session }),
      sellerWallet.save({ session }),
      bid.save({ session }),
      ask.save({ session }),
    ]);

    await session.commitTransaction();
    return new Response("matched");
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    return new Response("match failed", { status: 500 });
  } finally {
    session.endSession();
  }
}
