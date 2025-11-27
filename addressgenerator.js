// addressgenerator.js – ETH + TRX + BTC + BNB + SOL
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ECC from "tiny-secp256k1";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { derivePath } from "ed25519-hd-key";          // Solana derivation
import { Keypair, PublicKey } from "@solana/web3.js"; // Solana

const ECPair = ECPairFactory(ECC);
const network = bitcoin.networks.bitcoin;

// Generate 24-word mnemonic
const mnemonic = generateMnemonic(english, 256);
console.log("\nYOUR 24-WORD MNEMONIC:\n", mnemonic, "\n");

// Derive master node
const seed = mnemonicToSeedSync(mnemonic);
const root = HDKey.fromMasterSeed(seed);

// UUID → deterministic hardened index
function getIndex(uuid) {
  return parseInt(
    crypto.createHash("sha256").update(uuid).digest("hex").slice(0, 8),
    16
  ) & 0x7fffffff;
}

(async () => {
  const { default: tronwebLib } = await import("tronweb");
  const tronWeb = new tronwebLib.TronWeb({
    fullHost: "https://api.trongrid.io",
  });

  console.log("GENERATING FIRST 5 ADDRESSES (ETH + TRX + BTC + BNB + SOL)\n");

  for (let i = 0; i < 5; i++) {
    const userId = uuidv4();
    const index = getIndex(userId);

    // ---------------- ETH (BIP44: 60) ----------------
    const ethNode = root.derive(`m/44'/60'/0'/0/${index}`);
    const ethWallet = new ethers.Wallet(ethers.hexlify(ethNode.privateKey));

    // ---------------- BNB (BSC BEP20 BIP44: 714) ------
    const bnbNode = root.derive(`m/44'/714'/0'/0/${index}`);
    const bnbWallet = new ethers.Wallet(ethers.hexlify(bnbNode.privateKey));

    // ---------------- TRX (BIP44: 195) ----------------
    const tronNode = root.derive(`m/44'/195'/0'/0/${index}`);
    const tronPrivHex = Buffer.from(tronNode.privateKey).toString("hex");
    const tronAddress = tronWeb.address.fromPrivateKey(tronPrivHex);

    // ---------------- BTC Legacy ----------------------
    const btcNode = root.derive(`m/44'/0'/0'/0/${index}`);
    const { address: btcLegacy } = bitcoin.payments.p2pkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcNode.privateKey), {
        network,
      }).publicKey,
      network,
    });

    // ---------------- BTC Bech32 -----------------------
    const btcSegwitNode = root.derive(`m/84'/0'/0'/0/${index}`);
    const { address: btcBech32 } = bitcoin.payments.p2wpkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcSegwitNode.privateKey), {
        network,
      }).publicKey,
      network,
    });

    // ---------------- SOLANA (BIP44: 501) --------------
    const solDerive = derivePath(`m/44'/501'/0'/0'`, seed);
    const solKeypair = Keypair.fromSeed(solDerive.key);
    const solAddress = solKeypair.publicKey.toBase58();

    console.log(`User #${i + 1}`);
    console.log(`  UUID         : ${userId}`);
    console.log(`  Index        : ${index}`);
    console.log(`  ETH          : ${ethWallet.address}`);
    console.log(`  BNB (BEP20)  : ${bnbWallet.address}`);
    console.log(`  TRX          : ${tronAddress}`);
    console.log(`  BTC (Legacy) : ${btcLegacy}`);
    console.log(`  BTC (Bech32) : ${btcBech32}`);
    console.log(`  SOL          : ${solAddress}`);
    console.log("-".repeat(85));
  }
})();
