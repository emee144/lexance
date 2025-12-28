import mongoose from "mongoose";
import dotenv from "dotenv";
import CryptoDeposit from "./src/models/CryptoDeposit.js";
import DepositAddress from "./src/models/DepositAddress.js";
import Wallet from "./src/models/Wallet.js";

dotenv.config({ path: ".env.local" });
const { ObjectId } = mongoose.Types;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const userId = new ObjectId('694fe10c856c1e0b167d506c');
  const coin = "USDT";
  const network = "TRC20";
  const amount = 200000;
  const txHash = "trdea4d" + Date.now();
  const fromAddress = "TJo6lmj3vL2mP8nQfG7xHsZ4uK1bD6cE9p";

  const deposit = await CryptoDeposit.create({ user: userId, coin, network, amount, txHash, fromAddress, status: "completed" });
  console.log(" Deposit created and credited:", deposit);

  const depositAddress = await DepositAddress.findOne({ user: userId, coin, network });
  const wallet = await Wallet.findOne({ user: userId });

  console.log(" Updated DepositAddress:", depositAddress);
  console.log(" Updated Wallet:", wallet);

  await mongoose.disconnect();
}

run().catch(console.error);
