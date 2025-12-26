import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import DepositAddress from "@/models/DepositAddress";
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import crypto from "crypto";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ECC from "tiny-secp256k1";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ECPair = ECPairFactory(ECC);
const btcNetwork = bitcoin.networks.bitcoin;

async function getTronWeb() {
  const { default: TronWebLib } = await import("tronweb");
  return new TronWebLib.TronWeb({ fullHost: "https://api.trongrid.io" });
}

function getDeterministicIndex(userId) {
  const hash = crypto.createHash("sha256").update(userId.toString()).digest("hex");
  return parseInt(hash.slice(0, 8), 16) & 0x7fffffff;
}

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Email and password are required" }),
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email format" }),
      { status: 400 }
    );
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return new Response(
      JSON.stringify({
        error:
          "Password must be 8+ chars with uppercase, lowercase, number, and special char",
      }),
      { status: 400 }
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    // === START TRANSACTION ===
    const mongoose = await import("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
   
      const [user] = await User.create([{ email, password }], { session });

      await Wallet.create({ user: user._id });


      const mnemonic = generateMnemonic(english, 256);
      const seed = mnemonicToSeedSync(mnemonic);
      const master = HDKey.fromMasterSeed(seed);
      const index = getDeterministicIndex(user._id);
      const tronWeb = await getTronWeb();

      const ethNode = master.derive(`m/44'/60'/0'/0/${index}`);
      const ethAddress = new ethers.Wallet(
        ethers.hexlify(ethNode.privateKey)
      ).address;

      const tronNode = master.derive(`m/44'/195'/0'/0/${index}`);
      const tronPrivHex = Buffer.from(tronNode.privateKey).toString("hex");
      const trxAddress = tronWeb.address.fromPrivateKey(tronPrivHex);

      // BTC Legacy
      const btcNode = master.derive(`m/44'/0'/0'/0/${index}`);
      const btcLegacy = bitcoin.payments.p2pkh({
        pubkey: ECPair.fromPrivateKey(
          Buffer.from(btcNode.privateKey)
        ).publicKey,
        network: btcNetwork,
      }).address;

      // BTC Bech32
      const btcBech32Node = master.derive(`m/84'/0'/0'/0/${index}`);
      const btcBech32 = bitcoin.payments.p2wpkh({
        pubkey: ECPair.fromPrivateKey(
          Buffer.from(btcBech32Node.privateKey)
        ).publicKey,
        network: btcNetwork,
      }).address;

      // SOL
      const solNode = master.derive(`m/44'/501'/0'/0/${index}`);
      const solKeypair = SolanaKeypair.fromSeed(
        solNode.privateKey.slice(0, 32)
      );
      const solAddress = solKeypair.publicKey.toBase58();

      // BNB
      const bnbNode = master.derive(`m/44'/714'/0'/0/${index}`);
      const bnbWallet = new ethers.Wallet(
        ethers.hexlify(bnbNode.privateKey)
      );
      const bnbAddress = bnbWallet.address;

      await DepositAddress.insertMany(
        [
          { user: user._id, coin: "ETH", network: "ERC20", address: ethAddress, isActive: true },
          { user: user._id, coin: "TRX", network: "TRC20", address: trxAddress, isActive: true },
          { user: user._id, coin: "BTC", network: "BTC", address: btcLegacy, isActive: true },
          { user: user._id, coin: "BTC", network: "BTC-BECH32", address: btcBech32, isActive: true },
          { user: user._id, coin: "USDT", network: "ERC20", address: ethAddress, isActive: true },
          { user: user._id, coin: "USDT", network: "TRC20", address: trxAddress, isActive: true },
          { user: user._id, coin: "SOL", network: "SOL", address: solAddress, isActive: true },
          { user: user._id, coin: "BNB", network: "BEP20", address: bnbAddress, isActive: true },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const cookieStore = await cookies();
      cookieStore.set({
        name: "access_token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Account created successfully!",
          mnemonic,
          warning:
            "Save this recovery phrase NOW — it will NEVER be shown again!",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );

    } catch (err) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      console.error("Signup transaction error:", err);
      return new Response(
        JSON.stringify({ error: "Server error during signup" }),
        { status: 500 }
      );
    }

  } catch (err) {
    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
