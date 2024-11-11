require('dotenv').config();
const { ethers } = require("hardhat");

const owner1 = "0x72bA251b1FBC2d9268B93Aa74CD1cfcFC2C62BB8";
const owner2 = "0x6eDCf3aE8aC36B18a4590D764eE88b429D48243d"; 
const owner3 = "0x67763E259Ef0AD351AB01a638f5785606fE1aC8d";
const owner4 = "0x4657483ef920e7b90164A83967D65A0CD919585f";

const OWNERS = [owner1, owner2, owner3, owner4];
const THRESHOLD = 2;

const GnosisSafeMasterCopyAddress = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552"
const GnosisSafeProxyFactoryCopyAddress = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2"

async function main() {
  // Step 1: load the GnosisSafe mastercopy address for sepolia network
  const GnosisSafe = await ethers.getContractAt("GnosisSafe", GnosisSafeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: load the GnosisSafeProxyFactory masterrcopy a address for sepolia network
  const GnosisSafeProxyFactory = await ethers.getContractAt("GnosisSafeProxyFactory", GnosisSafeProxyFactoryCopyAddress);
  console.log("Interacting with deployed GnosisSafeProxyFactory at:", GnosisSafeProxyFactory.address);

  const to = ethers.constants.AddressZero; // No delegate call in this case
  const data = "0x"; // Empty data payload
  const fallbackHandler = ethers.constants.AddressZero; // No fallback handler
  const paymentToken = ethers.constants.AddressZero; // ETH as the payment token
  const payment = 0; // No payment involved
  const paymentReceiver = ethers.constants.AddressZero;

  // Step 3: Encode the setup function call
  const setupData = GnosisSafe.interface.encodeFunctionData("setup", [
    OWNERS,
    THRESHOLD,
    to,
    data,
    fallbackHandler,
    paymentToken,
    payment,
    paymentReceiver
  ]);

  // Step 4: Deploy the Gnosis Safe Proxy
  const tx = await GnosisSafeProxyFactory.createProxy(GnosisSafeMasterCopyAddress, setupData);
  const receipt = await tx.wait();

  // Step 5: Check events emitted by the transaction receipt
  const event = receipt.events.find(event => event.event === "ProxyCreation");
  const proxyAddress = event ? event.args.proxy : null;

  if (proxyAddress) {
      console.log("Gnosis Safe deployed at:", proxyAddress);
  } else {
      console.error("ProxyCreation event not found, unable to retrieve proxy address.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// ***** already deployed gnosis safe on sepolia *****
// sep:0x958246bA1A45D353525CDDB606CfB22fC20A0748