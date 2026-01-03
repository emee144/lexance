import mongoose from "mongoose";
import DepositAddress from "./DepositAddress.js";
import Wallet from "./Wallet.js";

const cryptoDepositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  network: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fromAddress: {
    type: String,
    trim: true,
  },
  toAddress: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["completed", "failed", "canceled"], 
    default: "completed",
  },
  credited: {
    type: Boolean,
    default: false,
  },
  creditedAt: {
    type: Date,
  },
  confirmations: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  collection: "cryptodeposits",
});


cryptoDepositSchema.index({ user: 1, status: 1, coin: 1 });
cryptoDepositSchema.index({ credited: 1, createdAt: -1 });

cryptoDepositSchema.pre("save", async function(next) {
  if (this.credited) return next(); 

  try {
    const { user, coin, network, amount } = this;

    await DepositAddress.findOneAndUpdate(
      { user, coin, network, isActive: true },
      {
        $inc: {
          balance: amount,
          totalDeposited: amount,
          transactionCount: 1,
        },
        $set: { lastUpdated: new Date() },
      },
      { new: true, upsert: true }
    );

    await Wallet.findOneAndUpdate(
      { user },
      { $inc: { [`assets.${coin}`]: amount } },
      { new: true, upsert: true }
    );

    this.credited = true;
    this.creditedAt = new Date();

    next();
  } catch (err) {
    console.error("Error crediting deposit:", err);
    next(err);
  }
});

export default mongoose.models.CryptoDeposit ||
  mongoose.model("CryptoDeposit", cryptoDepositSchema);
