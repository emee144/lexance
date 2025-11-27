// app/api/auth/signup/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
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
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password)
    return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,}$/;
  if (!passwordRegex.test(password))
    return new Response(
      JSON.stringify({
        error: "Password must be 8+ chars with uppercase, lowercase, number, and special char",
      }),
      { status: 400 }
    );

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });

    // === 1. Create user (password hashed by model pre-save hook) ===
    const user = await User.create({ email, password });

    // === 2. Generate 24-word mnemonic ===
    const mnemonic = generateMnemonic(english, 256);

    // === 3. Derive master seed and deterministic index ===
    const seed = mnemonicToSeedSync(mnemonic);
    const master = HDKey.fromMasterSeed(seed);
    const index = getDeterministicIndex(user._id);

    const tronWeb = await getTronWeb();

    // --- ETH ---
    const ethNode = master.derive(`m/44'/60'/0'/0/${index}`);
    const ethAddress = new ethers.Wallet(ethers.hexlify(ethNode.privateKey)).address;

    // --- TRX ---
    const tronNode = master.derive(`m/44'/195'/0'/0/${index}`);
    const tronPrivHex = Buffer.from(tronNode.privateKey).toString("hex");
    const trxAddress = tronWeb.address.fromPrivateKey(tronPrivHex);

    // --- BTC Legacy ---
    const btcNode = master.derive(`m/44'/0'/0'/0/${index}`);
    const btcLegacy = bitcoin.payments.p2pkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcNode.privateKey)).publicKey,
      network: btcNetwork,
    }).address;

    // --- BTC Bech32 ---
    const btcBech32Node = master.derive(`m/84'/0'/0'/0/${index}`);
    const btcBech32 = bitcoin.payments.p2wpkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcBech32Node.privateKey)).publicKey,
      network: btcNetwork,
    }).address;

    // --- USDT ---
    const usdtErc20Address = ethAddress;
    const usdtTrc20Address = trxAddress;

    // --- SOL ---
    const solNode = master.derive(`m/44'/501'/0'/0/${index}`);
    const solKeypair = SolanaKeypair.fromSeed(solNode.privateKey.slice(0, 32));
    const solAddress = solKeypair.publicKey.toBase58();

    // --- BNB (BEP20) ---
    const bnbNode = master.derive(`m/44'/714'/0'/0/${index}`);
    const bnbWallet = new ethers.Wallet(ethers.hexlify(bnbNode.privateKey));
    const bnbAddress = bnbWallet.address;

    await DepositAddress.create([
      { user: user._id, coin: "ETH", network: "ERC20", address: ethAddress, isActive: true },
      { user: user._id, coin: "TRX", network: "TRC20", address: trxAddress, isActive: true },
      { user: user._id, coin: "BTC", network: "BTC", address: btcLegacy, isActive: true },
      { user: user._id, coin: "BTC", network: "BTC-BECH32", address: btcBech32, isActive: true },
      { user: user._id, coin: "USDT", network: "ERC20", address: usdtErc20Address, isActive: true },
      { user: user._id, coin: "USDT", network: "TRC20", address: usdtTrc20Address, isActive: true },
      { user: user._id, coin: "SOL", network: "SOL", address: solAddress, isActive: true },
      { user: user._id, coin: "BNB", network: "BEP20", address: bnbAddress, isActive: true },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created! Save your recovery phrase below:",
        mnemonic,
        warning: "This phrase will NEVER be shown again. Write it down securely!",
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
