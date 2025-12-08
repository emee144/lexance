import mongoose from "mongoose";
import dotenv from "dotenv";
import CryptoDeposit from "./src/models/CryptoDeposit.js";
import DepositAddress from "./src/models/DepositAddress.js";
import Wallet from "./src/models/Wallet.js";

dotenv.config({ path: ".env.local" });
const { ObjectId } = mongoose.Types;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const userId = new ObjectId("692e65063c90bcd23a27d45e");
  const coin = "USDT";
  const network = "TRC20";
  const amount = 100;
  const txHash = "manual-test-" + Date.now();
  const fromAddress = "SomeExternalAddress";

  const deposit = await CryptoDeposit.create({ user: userId, coin, network, amount, txHash, fromAddress, status: "completed" });
  console.log("✅ Deposit created and credited:", deposit);

  const depositAddress = await DepositAddress.findOne({ user: userId, coin, network });
  const wallet = await Wallet.findOne({ user: userId });

  console.log("💰 Updated DepositAddress:", depositAddress);
  console.log("👜 Updated Wallet:", wallet);

  await mongoose.disconnect();
}

run().catch(console.error);
