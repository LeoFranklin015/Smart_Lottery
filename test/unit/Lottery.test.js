// const { assert } = require("chai");
// const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
// const {
//   developmentChain,
//   networkConfig,
// } = require("../../helper-hardhat-config");

// !developmentChain.includes(network.name)
//   ? describe.skip
//   : describe("Lottery", async () => {
//       let lottery, vrfCoordinatorV2Mock;
//       const chainId = network.config.chainId;
//       // beforeEach(async () => {
//       //   const { deployer } = await getNamedAccounts();
//       //   await deployments.fixture(["all"]);
//       //   lottery = await ethers.getContractAt("Lottery", deployer);
//       //   vrfCoordinatorV2Mock = await ethers.getContractAt(
//       //     "VRFCoordinatorV2Mock",
//       //     deployer
//       //   );
//       // });

//       beforeEach(async () => {
//         accounts = await ethers.getSigners(); // could also do with getNamedAccounts
//         //   deployer = accounts[0]
//         player = accounts[1];
//         await deployments.fixture(["mocks", "raffle"]); // Deploys modules with the tags "mocks" and "raffle"
//         vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // Returns a new connection to the VRFCoordinatorV2Mock contract
//         LotteryContract = await ethers.getContract("Raffle"); // Returns a new connection to the Raffle contract
//         lottery = LotteryContract.connect(player); // Returns a new instance of the Raffle contract connected to player
//         raffleEntranceFee = await raffle.getEntranceFee();
//         interval = await raffle.getInterval();
//       });
//       describe("Constructor", async () => {
//         it("intializes the lottery correctly", async () => {
//           const LotteryState = await LotteryContract.getLotteryState();
//           // const interval = await lottery.getInterval();
//           assert.equal(LotteryState.toString(), "0");
//           // assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
//         });
//       });
//     });

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle,
        raffleContract,
        vrfCoordinatorV2Mock,
        raffleEntranceFee,
        interval,
        player; // , deployer

      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        //   deployer = accounts[0]
        player = accounts[1];
        await deployments.fixture(["mocks", "raffle"]); // Deploys modules with the tags "mocks" and "raffle"
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // Returns a new connection to the VRFCoordinatorV2Mock contract
        raffleContract = await ethers.getContract("Raffle"); // Returns a new connection to the Raffle contract
        raffle = raffleContract.connect(player); // Returns a new instance of the Raffle contract connected to player
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });
      describe("constructor", function () {
        it("initializes the raffle correctly", async () => {
          // Ideally, we'd separate these out so that only 1 assert per "it" block
          // And ideally, we'd make this check everything
          const raffleState = (await raffle.getRaffleState()).toString();
          // Comparisons for Raffle initialization:
          assert.equal(raffleState, "0");
          assert.equal(
            interval.toString(),
            networkConfig[network.config.chainId]["keepersUpdateInterval"]
          );
        });
      });
      describe("Enter Raffle", async () => {
        it("reverts when you dont pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__SendMoreToEnterRaffle"
          );
        });
        it("It stores player when a he enters", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const playerJoinedNow = await raffle.getPlayer(0);
          assert.equal(playerJoinedNow, player.address);
        });
        it("emits an event", async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });
        it("doesnt allow when raffle is closed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith("Raffle__RaffleNotOpen");
        });
      });
      describe("CheckUpkeep", async () => {
        it("Doesnt run when no parameters are passed", async () => {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });
        it("Doesnt run when the raffle is closed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);
          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert.equal(raffleState.toString(), "1");
          assert.equal(upkeepNeeded, false);
        });
        it("Doesnt Run if time passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 10,
          ]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });
        it("All the possible are given , then it should return true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(upkeepNeeded);
        });
      });
      describe("performUpkeep", () => {
        it("it can only run when checkupkeep is true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const tx = await raffle.performUpkeep([]);
          assert(tx);
        });
        it("reverts when checkupkeep is false", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 10,
          ]);
          await network.provider.send("evm_mine", []);
          await expect(raffle.performUpkeep([])).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          );
        });
        it("updates the raffle state and emits the event for generating winner", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const tx = await raffle.performUpkeep([]);
          const txReceipt = await tx.wait(1);
          const requestId = await txReceipt.events[1].args.requestId;
          const raffleState = await raffle.getRaffleState();
          assert(requestId.toNumber() > 0);
          assert(raffleState.toString() == "1");
        });
      });
      describe("fulfillRandomWords", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });
        it("Only enters when performupkeep satisfies", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request");
        });
        it("Picks a winner , resets the account and transfer the money", async () => {
          const noOfAccounts = 3;
          const accountIndex = 1;
          const accounts = await ethers.getSigners();
          for (let i = accountIndex; i < accountIndex + noOfAccounts; i++) {
            const connectedAccount = await raffle.connect(accounts[i]);
            await connectedAccount.enterRaffle({ value: raffleEntranceFee });
          }
          const startingTimestamp = await raffle.getLastTimeStamp();

          await new Promise(async (resolve, reject) => {
            console.log("found the event");
            raffle.once("WinnerPicked", async () => {
              try {
                const recentWinnner = await raffle.getRecentWinner();
                console.log(recentWinnner);
                console.log(accounts[0].address);
                console.log(accounts[1].address);
                console.log(accounts[2].address);
                console.log(accounts[3].address);

                const raffleState = await raffle.getRaffleState();
                const endingTimeStamp = await raffle.getLastTimeStamp();
                const numofPlayers = await raffle.getNumberOfPlayers();
                const endingBalance = await accounts[1].getBalance();
                assert.equal(numofPlayers.toString(), "0");
                assert.equal(raffleState.toString(), "0");
                assert(endingTimeStamp > startingTimestamp);

                assert.equal(
                  endingBalance.toString(),
                  winnerStartingBalance.add(
                    raffleEntranceFee
                      .mul(noOfAccounts)
                      .add(raffleEntranceFee)
                      .toString()
                  )
                );
              } catch (error) {
                reject(error);
              }
              resolve();
            });
            const tx = await raffle.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            const winnerStartingBalance = await accounts[1].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });
    });
