// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract SimpleStorage {
  uint storedData;

  function setX(uint x) public {
    storedData = x;
  }

  function getX() public view returns (uint) {
    return storedData;
  }
}
