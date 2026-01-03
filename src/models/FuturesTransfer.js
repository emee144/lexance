import mongoose from "mongoose";
const FuturesTransferSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuturesAccount",
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ["IN", "OUT"], 
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.00000001, "Transfer amount must be greater than zero"],
    },

    source: {
      type: String,
      enum: ["assets", "funding"],
      default: "assets",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },

    reference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows null but enforces uniqueness if present
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "futurestransfers",
  }
);

FuturesTransferSchema.index({ user: 1, createdAt: -1 });
FuturesTransferSchema.index({ account: 1, createdAt: -1 });

export default mongoose.models.FuturesTransfer ||
  mongoose.model("FuturesTransfer", FuturesTransferSchema);
