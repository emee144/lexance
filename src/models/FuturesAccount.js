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

FuturesAccountSchema.virtual("marginAvailable").get(function () {
  return Math.max(this.balance - this.marginUsed, 0);
});

FuturesAccountSchema.set("toJSON", { virtuals: true });
FuturesAccountSchema.set("toObject", { virtuals: true });

export default mongoose.models.FuturesAccount ||
  mongoose.model("FuturesAccount", FuturesAccountSchema);
