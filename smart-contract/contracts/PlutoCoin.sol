// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlutoCoin is ERC20, Ownable {
    address public minter;

    constructor(address initialOwner) ERC20("PlutoCoin", "PCN") Ownable(initialOwner) {}

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == minter, "Not authorized to mint");
        _mint(to, amount);
    }
}
