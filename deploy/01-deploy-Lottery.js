const { network, ethers } = require("hardhat");
const { developmentChain, networkCofig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address;
  if (developmentChain.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.getAddress;
  } else {
    vrfCoordinatorV2Address = networkCofig[chainId]["vrfCoordinatorV2"];
  }

  const lottery = await deploy("Lottery", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};
