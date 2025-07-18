// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BattleCardNFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("Battle Card", "CARD") {}

    function mint(address to, string memory tokenURI) public {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
}
