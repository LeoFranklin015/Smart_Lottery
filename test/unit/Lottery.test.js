const { assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChain,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("Lottery", async () => {
      let lottery, vrfCoordinatorV2Mock;
      const chainId = network.config.chainId;
      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);
        lottery = await ethers.getContractAt("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContractAt(
          "vrfCoordinatorV2Mock",
          deployer
        );
      });
      describe("Constructor", async () => {
        it("intializes the lottery correctly", async () => {
          const LotteryState = await lottery.getLotteryState();
          const interval = await lottery.getInterval();
          assert.equal(LotteryState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });
    });
