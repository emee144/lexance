import mongoose from "mongoose";
const COINS = ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA", "USDC"];

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
