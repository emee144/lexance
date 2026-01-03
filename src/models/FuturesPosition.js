import mongoose from "mongoose";
const FuturesPositionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pair: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "BTCUSDT",
    },
    side: {
      type: String,
      enum: ["long", "short"],
      required: true,
    },
    leverage: {
      type: Number,
      required: true,
      min: [1, "Leverage must be at least 1"],
      max: [125, "Leverage cannot exceed 125"],
    },
    entryPrice: {
      type: Number,
      required: true,
      min: [0, "Entry price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity must be positive"],
    },
    margin: {
      type: Number,
      required: true,
      min: [0, "Margin cannot be negative"],
    },
    unrealizedPnl: {
      type: Number,
      default: 0,
    },
    realizedPnl: {
      type: Number,
      default: 0,
    },
    markPrice: {
      type: Number,
      default: null,
    },
    liquidationPrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "closed", "liquidated"],
      default: "open",
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    closeReason: {
      type: String,
      enum: ["manual", "take_profit", "stop_loss", "liquidated", "adl"],
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: "futurespositions",
  }
);

FuturesPositionSchema.index({ user: 1, status: 1 });
FuturesPositionSchema.index({ pair: 1, status: 1 });

FuturesPositionSchema.virtual("roiPercentage").get(function () {
  if (this.margin === 0) return 0;
  return ((this.unrealizedPnl || this.realizedPnl) / this.margin) * 100;
});

FuturesPositionSchema.set("toJSON", { virtuals: true });
FuturesPositionSchema.set("toObject", { virtuals: true });

export default mongoose.models.FuturesPosition ||
  mongoose.model("FuturesPosition", FuturesPositionSchema);