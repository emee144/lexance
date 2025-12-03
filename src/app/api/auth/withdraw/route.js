import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import DepositAddress from "@/models/DepositAddress";
import Withdrawal from "@/models/Withdrawal";

export async function POST(req) {
  await connectDB();

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { coin, network, amount, withdrawAddress } = await req.json();

    if (!coin || !network || !amount || !withdrawAddress) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const amt = Number(amount);
    if (amt <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Example network fees
    const externalWithdrawalFees = {
      USDT: { TRC20: 1, ERC20: 5, BEP20: 1 },
      BTC: { BTC: 0.0005, "BTC-Bech32": 0.0005 },
      ETH: { ERC20: 0.005 },
      BNB: { BEP20: 0.001 },
      TRX: { TRC20: 1 },
    };

    const fee = externalWithdrawalFees[coin]?.[network] || 0;
    if (amt <= fee) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than network fee" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deposit = await DepositAddress.findOne({
      user: user._id,
      coin,
      network,
      isActive: true,
    });

    if (!deposit) {
      return new Response(
        JSON.stringify({ error: "No balance found for this coin" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (deposit.balance < amt) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Deduct balance
    deposit.balance -= amt;
    await deposit.save();

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      user: user._id,
      coin,
      network,
      amount: amt,
      fee,
      netAmount: amt - fee,
      withdrawAddress,
      status: "pending", 
    });

    return new Response(
      JSON.stringify({ message: "Withdrawal initiated", withdrawal }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Withdraw API error:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
