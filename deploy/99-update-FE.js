const { ethers, network } = require("hardhat");
const fs = require("fs");
const FRONT_END_ABI_ADDRESS = "../fe-lottery/src/constants/abi.json";
const FRONT_END_ADDRESSES_FILE =
  "../fe-lottery/src/constants/contractAddress.json";
module.exports = async () => {
  if (process.env.UPDATE_FE) {
    console.log("Update FE");
    updateContractAddress();
    updateABI();
  }
};

const updateABI = async () => {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    FRONT_END_ABI_ADDRESS,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
};

const updateContractAddress = async () => {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId.toString();
  const currentAddress = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(raffle.address)) {
      currentAddress[chainId].push(raffle.address);
    }
  } else {
    currentAddress[chainId] = [raffle.address];
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddress));
};

module.exports.tags = ["all", "frontend "];
