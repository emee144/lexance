import dotenv from "dotenv";
dotenv.config();

import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";

const MNEMONIC = process.env.MASTER_MNEMONIC;
if (!MNEMONIC) throw new Error("MASTER_MNEMONIC missing");

const walletIndex = 7; 
const path = `m/44'/195'/0'/0/${walletIndex}`; 

// ===============================
// DERIVATION
// ===============================
const seed = mnemonicToSeedSync(MNEMONIC);
const masterNode = HDKey.fromMasterSeed(seed);

const childNode = masterNode.derive(path);

if (!childNode.privateKey) {
  throw new Error("Failed to derive private key");
}

// ===============================
// OUTPUT
// ===============================
const privateKeyHex = Buffer.from(childNode.privateKey).toString("hex");

console.log("Derivation path:", path);
console.log("Private key (hex):", privateKeyHex);
