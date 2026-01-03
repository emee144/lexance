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
      enum: ["USDT", "BTC", "ETH", "BNB", "SOL", "TRX", "ADA", "USDC"],
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

    address: {
      type: String,
      required: true,
      trim: true,
    },

    tag: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDeposited: {
      type: Number,
      default: 0,
    },

    transactionCount: {
      type: Number,
      default: 0,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

DepositAddressSchema.index(
  { user: 1, coin: 1, network: 1 },
  { unique: true }
);

DepositAddressSchema.index(
  { address: 1, network: 1 },
  { unique: true }
);

DepositAddressSchema.index({ isActive: 1 });
DepositAddressSchema.index({ balance: 1 });

DepositAddressSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.balance = Number(ret.balance);
    ret.totalDeposited = Number(ret.totalDeposited);
    ret.transactionCount = Number(ret.transactionCount);
    return ret;
  },
});

export default mongoose.models.DepositAddress ||
  mongoose.model("DepositAddress", DepositAddressSchema);
