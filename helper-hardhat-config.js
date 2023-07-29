// // const { ethers } = require("hardhat");

// // const networkConfig = {
// //   11155111: {
// //     name: "sepolia",
// //     vrfCoordinatorV2: "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
// //     entranceFee: ethers.utils.parseEther("0.1"),
// //     gasLane:
// //       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
// //     subscriptionId: "0",
// //     callBackGasLimit: "50000",
// //     interval: "30",
// //   },
// //   31337: {
// //     name: "hardhat",
// //     vrfCoordinatorV2: "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
// //     entranceFee: ethers.utils.parseEther("0.01"),
// //     gasLane:
// //       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
// //     subscriptionId: "0",
// //     callBackGasLimit: "50000",
// //     interval: "30",
// //   },
// // };

// // const developmentChains = ["hardhat", "localhost"];

// // module.exports = {
// //   networkConfig,
// //   developmentChains,
// // };

// const { ethers } = require("hardhat");

// const networkConfig = {
//   default: {
//     name: "hardhat",
//     keepersUpdateInterval: "30",
//   },
//   31337: {
//     name: "localhost",
//     subscriptionId: "588",
//     gasLane:
//       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
//     keepersUpdateInterval: "30",
//     raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
//     callbackGasLimit: "500000", // 500,000 gas
//   },
//   11155111: {
//     name: "sepolia",
//     subscriptionId: "4014",
//     gasLane:
//       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
//     keepersUpdateInterval: "30",
//     raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
//     callbackGasLimit: "500000", // 500,000 gas
//     vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
//   },
// };

// const developmentChains = ["hardhat", "localhost"];
// const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

// module.exports = {
//   networkConfig,
//   developmentChains,
//   VERIFICATION_BLOCK_CONFIRMATIONS,
// };

const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
    },
    11155111: {
        name: "sepolia",
        subscriptionId: "4015",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
    1: {
        name: "mainnet",
        keepersUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6


module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,

}
