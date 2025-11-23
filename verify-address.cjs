// verify-address.js
const { mnemonicToSeedSync } = require("bip39");
const HDKey = require("hdkey");
const { privateToAddress, toChecksumAddress } = require("ethereumjs-util");
const TronWeb = require("tronweb");
const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',  
});
// YOUR MASTER MNEMONIC (put here temporarily, then delete!)
const MASTER_MNEMONIC = "culture differ cushion divide barrel illness picnic timber coral task slender when such joke limb local decide elbow spread gown icon blanket amount fix";

// Address you want to verify
const ADDRESS_TO_VERIFY = "TSmyBxyEUqRnjpH9wDxw6CYStci4F24Quq"; 
const COIN = "USDT";        // USDT, ETH, BTC
const NETWORK = "TRC20";    // ERC20, BEP20, TRC20

// Derivation paths
const PATHS = {
  ETH: "m/44'/60'/0'/0/",   // ERC20 / BEP20 / USDT
  TRON: "m/44'/195'/0'/0/", // TRC20
};

console.log("Verifying address against master seed...\n");

const seed = mnemonicToSeedSync(MASTER_MNEMONIC);
const master = HDKey.fromMasterSeed(seed);

let found = false;

for (let i = 0; i < 1000; i++) {
  let derivedAddress = "";
if (NETWORK === "TRC20") {
  const key = master.derive(PATHS.TRON + i);
  const privateKeyHex = key.privateKey.toString('hex');
  
  try {
    const account = tronWeb.utils.accounts.generateAccountWithPrivateKey('0x' + privateKeyHex);
    derivedAddress = account.address;  
  } catch (err) {
    console.log("Error generating TRON address at index", i, err.message);
    continue;
  }
}
 else if (NETWORK === "ERC20" || NETWORK === "BEP20") {
    const key = master.derive(PATHS.ETH + i);
    const addr = privateToAddress(key.privateKey).toString("hex");
    derivedAddress = toChecksumAddress("0x" + addr);
  } else {
    console.log("BTC not fully implemented in this simple version");
    continue;
  }

  if (derivedAddress.toLowerCase() === ADDRESS_TO_VERIFY.toLowerCase()) {
    console.log("ADDRESS MATCH FOUND!");
    console.log("User index:", i);
    console.log("Coin:", COIN);
    console.log("Network:", NETWORK);
    console.log("Address:", derivedAddress);
    console.log("\nThis address WAS generated from your master seed.");
    found = true;
    break;
  }
}

if (!found) {
  console.log("NO MATCH in first 1000 users.");
  console.log("Possible reasons:");
  console.log("  • Wrong network selected");
  console.log("  • User index > 999");
  console.log("  • Address not from this seed");
}

console.log("\nVerification complete.");