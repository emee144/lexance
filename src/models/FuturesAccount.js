import mongoose from "mongoose";

const FuturesAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    marginUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    equity: {
      type: Number,
      default: 0, // balance + unrealized PnL
    },

    marginAvailable: {
      type: Number,
      default: 0,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "futuresaccounts",
  }
);

export default mongoose.models.FuturesAccount ||
  mongoose.model("FuturesAccount", FuturesAccountSchema);
