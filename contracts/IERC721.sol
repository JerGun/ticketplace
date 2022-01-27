// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

interface IERC721 {
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}