// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PlutoCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlutoCoinStore is Ownable {
    PlutoCoin public token;
    address payable public treasury;

     constructor(
        address _token,
        address payable _treasury,
        address initialOwner
    ) Ownable(initialOwner) {
        token = PlutoCoin(_token);
        treasury = _treasury;
    }

    function buyCoins() public payable {
        require(msg.value >= 0.0005 ether, "Minimum: 0.0005 ETH");

        uint256 coinsToMint = (msg.value * 160_000) / 1 ether; // 80 coins per 0.0005 ETH
        token.mint(msg.sender, coinsToMint);

        treasury.transfer(msg.value);
    }

    function setToken(address _token) public onlyOwner {
        token = PlutoCoin(_token);
    }

    function setTreasury(address payable _treasury) public onlyOwner {
        treasury = _treasury;
    }
}
