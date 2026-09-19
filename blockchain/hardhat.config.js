require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const accounts = [];
const privateKey = process.env.PRIVATE_KEY;

if (privateKey && privateKey !== "YOUR_METAMASK_PRIVATE_KEY") {
  if (privateKey.startsWith("0x") && privateKey.length === 66) {
    accounts.push(privateKey);
  } else if (privateKey.length === 64) {
    accounts.push("0x" + privateKey);
  }
}

const config = {
  solidity: "0.8.20",
  networks: {}
};

if (accounts.length > 0 && process.env.ALCHEMY_SEPOLIA_URL && process.env.ALCHEMY_SEPOLIA_URL !== "https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY") {
  config.networks.sepolia = {
    url: process.env.ALCHEMY_SEPOLIA_URL,
    accounts: accounts
  };
}

module.exports = config;
