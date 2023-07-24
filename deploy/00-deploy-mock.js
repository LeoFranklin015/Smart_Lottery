const { network, ethers } = require("hardhat");
const { developmentChain } = require("../helper-hardhat-config");

const BASE_FEE = ethers.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //   const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChain.includes(network.name)) {
    log("LOCAL NETWORK detected ... Deploying Mocks");

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
      //   waitConfirmations: network.config.blockConfirmations,
    });

    log("Mocks Deployed");
    log(
      "---------------------------------------------------------------------------------"
    );
  }
};

module.exports.tags = ["all", "mocks"];
