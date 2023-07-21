// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Lottery_NotEnoughFund();

contract Lottery is VRFConsumerBaseV2 {
    //State Variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    //EVENTS

    event LotteryEnter(address indexed player);

    constructor(
        address linkerAddress,
        uint256 entranceFee
    ) VRFConsumerBaseV2(linkerAddress) {
        i_entranceFee = entranceFee;
    }

    function enterLottery() public payable {
        if (msg.value < i_entranceFee) {
            revert Lottery_NotEnoughFund();
        }
        s_players.push(payable(msg.sender));
        emit LotteryEnter(msg.sender);
    }

    function LotteryRequest() external {}

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {}

    //View Functions
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
