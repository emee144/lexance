// models/CryptoDeposit.js   ← ES Module version (2025 Lexance standard)

import mongoose from 'mongoose';

const cryptoDepositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  network: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fromAddress: {
    type: String,
    trim: true
  },
  toAddress: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'canceled'],
    default: 'pending'
  },
  credited: {
    type: Boolean,
    default: false
  },
  creditedAt: {
    type: Date
  },
  confirmations: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,       
  collection: 'cryptodeposits'
});

cryptoDepositSchema.index({ user: 1, status: 1, coin: 1 });
cryptoDepositSchema.index({ txHash: 1 });
cryptoDepositSchema.index({ credited: 1, createdAt: -1 });

export default mongoose.model('CryptoDeposit', cryptoDepositSchema);