// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./PlutoCoin.sol";
import "./BattleCardNFT.sol"; // Your NFT contract
import "@openzeppelin/contracts/access/Ownable.sol";

contract CardMarketplace is Ownable {
    PlutoCoin public coin;
    BattleCardNFT public nft;

    constructor(
        address _coin,
        address _nft,
        address initialOwner
    ) Ownable(initialOwner) {
        coin = PlutoCoin(_coin);
        nft = BattleCardNFT(_nft);
    }

    function buyCard(uint256 price, string memory tokenURI) external {
        require(coin.balanceOf(msg.sender) >= price, "Not enough coins");

        // Transfer coins to the marketplace (or treasury)
        coin.transferFrom(msg.sender, address(this), price);

        // Mint NFT card to buyer
        nft.mint(msg.sender, tokenURI);
    }

    // Optional: withdraw coins to your treasury
    function withdrawCoins(address to) external onlyOwner {
        uint256 balance = coin.balanceOf(address(this));
        require(balance > 0, "No coins to withdraw");
        coin.transfer(to, balance);
    }

    // Set/update NFT or token contract if needed
    function setToken(address _coin) external onlyOwner {
        coin = PlutoCoin(_coin);
    }

    function setNFT(address _nft) external onlyOwner {
        nft = BattleCardNFT(_nft);
    }
}
