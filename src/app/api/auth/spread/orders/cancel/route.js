export async function POST(req) {
  await connectDB();
  const user = await getCurrentUser();
  const { orderId } = await req.json();

  const order = await SpreadOrder.findOne({ _id: orderId, user: user._id });
  if (!order || order.status !== "open")
    return NextResponse.json({ error: "Cannot cancel" }, { status: 400 });

  const wallet = await Wallet.findOne({ user: user._id });

  if (order.side === "bid") {
    wallet.funding += order.price * order.quantity;
  } else {
    wallet.assets.BTC =
      (wallet.assets.BTC || 0) + order.quantity;
  }

  order.status = "cancelled";
  await order.save();
  await wallet.save();

  return NextResponse.json({ success: true });
}
