const { ethers } = require("hardhat");

async function main() {
  const MediTrust = await ethers.getContractFactory("MediTrustCrowdfunding");
  const contract = await MediTrust.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`\n=========================================`);
  console.log(`MediTrustCrowdfunding contract deployed!`);
  console.log(`Contract Address: ${address}`);
  console.log(`=========================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
