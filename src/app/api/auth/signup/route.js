import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import DepositAddress from "@/models/DepositAddress";

import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";

import { ethers } from "ethers";

import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";

import { TronWeb } from "tronweb";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ===============================
// BITCOIN SETUP
// ===============================
const ECPair = ECPairFactory(ecc);
const btcNetwork = bitcoin.networks.bitcoin;

// ===============================
// MASTER SEED (EXCHANGE LEVEL)
// ===============================
const MASTER_MNEMONIC = process.env.MASTER_MNEMONIC;
if (!MASTER_MNEMONIC) throw new Error("MASTER_MNEMONIC environment variable is required");

const masterSeed = mnemonicToSeedSync(MASTER_MNEMONIC);
const masterNode = HDKey.fromMasterSeed(masterSeed);

// ===============================
// TRONWEB INSTANCE
// ===============================
function getTronWeb() {
  return new TronWeb({ fullHost: "https://api.trongrid.io" });
}

// ===============================
// SIGNUP HANDLER
// ===============================
export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  // ===============================
  // VALIDATION
  // ===============================
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) return NextResponse.json({ error: "Password must be 8+ chars, include upper, lower, number & symbol" }, { status: 400 });

  try {
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const mongoose = await import("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ===============================
      // GET NEXT WALLET INDEX
      // ===============================
      const lastUser = await User.findOne({}, {}, { sort: { walletIndex: -1 } }).lean();
      const nextWalletIndex = lastUser ? lastUser.walletIndex + 1 : 0;

      // ===============================
      // CREATE USER + WALLET
      // ===============================
      const [user] = await User.create([{ email, password, walletIndex: nextWalletIndex }], { session });
      await Wallet.create([{ user: user._id }], { session });

      const userIndex = user.walletIndex;
      const tronWeb = getTronWeb();

      // ===============================
      // ETH / ERC20
      // ===============================
      const ethNode = masterNode.derive(`m/44'/60'/0'/0/${userIndex}`);
      const ethPrivKey = "0x" + Buffer.from(ethNode.privateKey).toString("hex");
      const ethAddress = new ethers.Wallet(ethPrivKey).address;

      // ===============================
      // TRON / TRC20
      // ===============================
      const trxNode = masterNode.derive(`m/44'/195'/0'/0/${userIndex}`);
      const trxPrivKey = Buffer.from(trxNode.privateKey).toString("hex");
      const trxAddress = tronWeb.address.fromPrivateKey(trxPrivKey);

      // ===============================
      // BITCOIN LEGACY (P2PKH)
      // ===============================
      const btcLegacyNode = masterNode.derive(`m/44'/0'/0'/0/${userIndex}`);
      const btcLegacyKey = ECPair.fromPrivateKey(Buffer.from(btcLegacyNode.privateKey));
      const btcLegacy = bitcoin.payments.p2pkh({ pubkey: btcLegacyKey.publicKey, network: btcNetwork }).address;

      // ===============================
      // BITCOIN BECH32 (P2WPKH)
      // ===============================
      const btcBech32Node = masterNode.derive(`m/84'/0'/0'/0/${userIndex}`);
      const btcBech32Key = ECPair.fromPrivateKey(Buffer.from(btcBech32Node.privateKey));
      const btcBech32 = bitcoin.payments.p2wpkh({ pubkey: btcBech32Key.publicKey, network: btcNetwork }).address;

      // ===============================
      // BNB (BEP20)
      // ===============================
      const bnbNode = masterNode.derive(`m/44'/714'/0'/0/${userIndex}`);
      const bnbPrivKey = "0x" + Buffer.from(bnbNode.privateKey).toString("hex");
      const bnbAddress = new ethers.Wallet(bnbPrivKey).address;

      // ===============================
      // SOLANA
      // ===============================
      const solNode = masterNode.derive(`m/44'/501'/${userIndex}'/0'`);
      const { Keypair } = await import("@solana/web3.js");
      const solKeypair = Keypair.fromSeed(solNode.privateKey.slice(0, 32));
      const solAddress = solKeypair.publicKey.toBase58();

      const addresses = [
        { coin: "ETH", network: "ERC20", address: ethAddress },
        { coin: "USDT", network: "ERC20", address: ethAddress },

        { coin: "TRX", network: "TRC20", address: trxAddress },
        { coin: "USDT", network: "TRC20", address: trxAddress },

        { coin: "BTC", network: "BTC", address: btcLegacy },
        { coin: "BTC", network: "BTC-BECH32", address: btcBech32 },

        { coin: "BNB", network: "BEP20", address: bnbAddress },

        { coin: "SOL", network: "SOL", address: solAddress },
      ];

      await DepositAddress.insertMany(
        addresses.map(a => ({ user: user._id, ...a, isActive: true })),
        { session }
      );

      await session.commitTransaction();

      // ===============================
      // JWT SESSION
      // ===============================
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const cookieStore = await cookies();
      cookieStore.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Account created successfully" }, { status: 201 });

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
