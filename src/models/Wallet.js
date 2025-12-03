import mongoose from "mongoose";

const COINS = ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA"];

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One wallet per user
    },

    assets: {
      type: Map,
      of: Number,
      default: () => {
        const map = {};
        COINS.forEach((c) => (map[c] = 0));
        return map;
      },
    },

    // Funding balances per coin
    funding: {
      type: Map,
      of: Number,
      default: () => {
        const map = {};
        COINS.forEach((c) => (map[c] = 0));
        return map;
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
