const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle,
        raffleContract,
        vrfCoordinatorV2Mock,
        raffleEntranceFee,
        interval,
        player; // , deployer

      beforeEach(async () => {
        player = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", player); // Returns a new connection to the Raffle contract
        raffleEntranceFee = await raffle.getEntranceFee();
      });
      describe("fullfillRandomWords", () => {
        it(" works with automation on chainlink", async () => {
          const startingTimestamp = await raffle.getTimeStamp();
          const accounts = await ethers.getSigners();
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("Winner picked and event fired...");
            });
            try {
              const recentWinnner = raffle.getRecentWinner();
              const raffleState = raffle.getRaffleState();
              const endingTimeStamp = await raffle.getTimeStamp();
              const endingBalance = await accounts[0].getBalance();

              await expect(raffle.getPlayers(0)).to.be.reverted;
              assert.equal(recentWinnner.toString(), accounts[0].address);
              assert.equal(raffleState.toString(), "0");
              assert(endingTimeStamp > startingTimestamp);
              assert.equal(
                endingBalance.toString(),
                startingBalance.add(raffleEntranceFee).toString
              );
              resolve();
            } catch (error) {
              console, log(error);
              reject(error);
            }
            await raffle.enterRaffle({ value: raffleEntranceFee });
            const startingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
