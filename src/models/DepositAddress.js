// models/DepositAddress.js
import mongoose from "mongoose";

const DepositAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    coin: {
      type: String,
      required: true,
      enum: ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA"],
    },

    network: {
      type: String,
      required: true,
      enum: [
        "TRC20",
        "ERC20",
        "BEP20",
        "BTC",        
        "BTC-BECH32", 
        "SOL",
        "ADA",
      ],
    },

    address: { type: String, required: true, unique: true, trim: true },
    tag: { type: String },
    isActive: { type: Boolean, default: true },
    totalDeposited: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per user + coin + network
DepositAddressSchema.index({ user: 1, coin: 1, network: 1 }, { unique: true });
DepositAddressSchema.index({ isActive: 1 });

export default mongoose.models.DepositAddress ||
  mongoose.model("DepositAddress", DepositAddressSchema);