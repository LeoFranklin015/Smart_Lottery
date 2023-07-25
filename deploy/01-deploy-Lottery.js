const { network, ethers } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const VRF_SUBSCRIPTION_FUND_AMOUNT = ethers.parseEther("0.3");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId;
  if (developmentChain.includes(network.name)) {
    try {
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock"
      );
      vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target;
      const transactionResponse =
        await vrfCoordinatorV2Mock.createSubscription();
      const transactionReceipt = await transactionResponse.wait(1);
      // subscriptionId = transactionReceipt.events[0].args.subId;
      // await vrfCoordinatorV2Mock.fundSubscription(
      //   subscriptionId,
      //   VRF_SUBSCRIPTION_FUND_AMOUNT
      // );
    } catch (error) {
      console.error(
        "Error while interacting with VRFCoordinatorV2Mock:",
        error
      );
      throw error; // Rethrow the error to stop deployment
    }
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"];
  const interval = networkConfig[chainId]["interval"];

  console.log("Address :", vrfCoordinatorV2Address);
  console.log("entranceFee:", entranceFee);
  console.log("gasLane:", gasLane);
  console.log("VRF_SUBSCRIPTION_FUND_AMOUNT:", VRF_SUBSCRIPTION_FUND_AMOUNT);
  console.log("callBackGasLimit:", callBackGasLimit);
  console.log("interval:", interval);

  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callBackGasLimit,
    interval,
  ];

  console.log(args);
  try {
    const lottery = await deploy("Lottery", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChain.includes(network.name) && process.env.ETHERSCAN_KEY) {
      log("Verifying...... ");
      await verify(lottery.address, args);
    }

    log("-------------------------------------");
  } catch (error) {
    console.error("Error while deploying the Lottery contract:", error);
    throw error; // Rethrow the error to stop deployment
  }
};

module.exports.tags = ["all", "lottery"];
