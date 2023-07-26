// const { network, ethers } = require("hardhat");
// const { developmentChain, networkConfig } = require("../helper-hardhat-config");
// const { verify } = require("../utils/verify");
// const VRF_SUBSCRIPTION_FUND_AMOUNT = ethers.utils.parseEther("1");
// require("dotenv").config();

// module.exports = async ({ getNamedAccounts, deployments }) => {
//   const { deploy, log } = deployments;
//   const { deployer } = await getNamedAccounts();
//   const chainId = network.config.chainId;
//   let vrfCoordinatorV2Address, subscriptionId;
//   if (developmentChain.includes(network.name)) {
//     try {
//       const vrfCoordinatorV2Mock = await ethers.getContract(
//         "VRFCoordinatorV2Mock"
//       );
//       vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target;
//       const transactionResponse =
//         await vrfCoordinatorV2Mock.createSubscription();
//       const transactionReceipt = await transactionResponse.wait();
//       subscriptionId = transactionReceipt.events[0].args.subId;
//       await vrfCoordinatorV2Mock.fundSubscription(
//         subscriptionId,
//         VRF_SUBSCRIPTION_FUND_AMOUNT
//       );
//     } catch (error) {
//       console.error(
//         "Error while interacting with VRFCoordinatorV2Mock:",
//         error
//       );
//       throw error; // Rethrow the error to stop deployment
//     }
//   } else {
//     vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
//     subscriptionId = networkConfig[chainId]["subscriptionId"];
//   }

//   const entranceFee = networkConfig[chainId]["entranceFee"];
//   const gasLane = networkConfig[chainId]["gasLane"];
//   const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"];
//   const interval = networkConfig[chainId]["interval"];

//   console.log("Address :", vrfCoordinatorV2Address);
//   console.log("entranceFee:", entranceFee);
//   console.log("gasLane:", gasLane);
//   console.log("VRF_SUBSCRIPTION_FUND_AMOUNT:", VRF_SUBSCRIPTION_FUND_AMOUNT);
//   console.log("callBackGasLimit:", callBackGasLimit);
//   console.log("interval:", interval);

//   const args = [
//     vrfCoordinatorV2Address,
//     entranceFee,
//     gasLane,
//     subscriptionId,
//     callBackGasLimit,
//     interval,
//   ];

//   console.log(args);
//   try {
//     const lottery = await deploy("Lottery", {
//       from: deployer,
//       args: args,
//       log: true,
//       waitConfirmations: network.config.blockConfirmations || 1,
//     });

//     if (!developmentChain.includes(network.name) && process.env.ETHERSCAN_KEY) {
//       log("Verifying...... ");
//       await verify(lottery.address, args);
//     }

//     log("-------------------------------------");
//   } catch (error) {
//     console.error("Error while deploying the Lottery contract:", error);
//     throw error; // Rethrow the error to stop deployment
//   }
// };

// module.exports.tags = ["all", "lottery"];

const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const FUND_AMOUNT = ethers.utils.parseEther("1"); // 1 Ether, or 1e18 (10^18) Wei

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

  if (chainId == 31337) {
    // create VRFV2 Subscription
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["keepersUpdateInterval"],
    networkConfig[chainId]["raffleEntranceFee"],
    networkConfig[chainId]["callbackGasLimit"],
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
  }

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(raffle.address, arguments);
  }

  log("Enter lottery with command:");
  const networkName = network.name == "hardhat" ? "localhost" : network.name;
  log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "raffle"];
