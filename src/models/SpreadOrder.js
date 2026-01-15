import mongoose from "mongoose";

const SpreadOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pair: {
      type: String,
      default: "BTCUSDT",
    },

    side: {
      type: String,
      enum: ["bid", "ask"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    filledQuantity: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["open", "partial", "filled", "cancelled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SpreadOrder ||
  mongoose.model("SpreadOrder", SpreadOrderSchema);
