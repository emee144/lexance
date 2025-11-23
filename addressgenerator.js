// addressgenerator.js – ETH + TRX + BTC (all real mainnet addresses)
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ECC from "tiny-secp256k1";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

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
  return parseInt(crypto.createHash("sha256").update(uuid).digest("hex").slice(0, 8), 16) & 0x7fffffff;
}

// Async wrapper to fix tronweb ESM constructor bug (v6.1.0)
(async () => {
  // Dynamic import tronweb as CommonJS to bypass ESM export issues
  const { default: tronwebLib } = await import('tronweb');
  const tronWeb = new tronwebLib.TronWeb({ fullHost: "https://api.trongrid.io" });

  console.log("GENERATING FIRST 5 REAL ADDRESSES (ETH + TRX + BTC)\n");

  for (let i = 0; i < 5; i++) {
    const userId = uuidv4();
    const index = getIndex(userId);

    // Ethereum: m/44'/60'/0'/0/index
    const ethNode = root.derive(`m/44'/60'/0'/0/${index}`);
    const ethWallet = new ethers.Wallet(ethers.hexlify(ethNode.privateKey));

    // Tron: m/44'/195'/0'/0/index – FIX: plain hex, no 0x prefix
    const tronNode = root.derive(`m/44'/195'/0'/0/${index}`);
    const tronPrivHex = Buffer.from(tronNode.privateKey).toString("hex");
    const tronAddress = tronWeb.address.fromPrivateKey(tronPrivHex);  // ← plain hex only

    // Bitcoin – Legacy P2PKH (starts with 1) – BIP44
    const btcNode = root.derive(`m/44'/0'/0'/0/${index}`);
    const { address: btcLegacy } = bitcoin.payments.p2pkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcNode.privateKey), { network }).publicKey,
      network
    });

    // Bitcoin – SegWit Bech32 (starts with bc1) – BIP84
    const btcSegwitNode = root.derive(`m/84'/0'/0'/0/${index}`);
    const { address: btcBech32 } = bitcoin.payments.p2wpkh({
      pubkey: ECPair.fromPrivateKey(Buffer.from(btcSegwitNode.privateKey), { network }).publicKey,
      network
    });

    console.log(`User #${i + 1}`);
    console.log(`  UUID         : ${userId}`);
    console.log(`  Index        : ${index}`);
    console.log(`  ETH          : ${ethWallet.address}`);
    console.log(`  TRX          : ${tronAddress}`);
    console.log(`  BTC (Legacy) : ${btcLegacy}`);
    console.log(`  BTC (Bech32) : ${btcBech32}`);
    console.log("-".repeat(85));
  }
})();