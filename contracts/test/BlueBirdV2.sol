// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../BlueBird.sol";

contract BlueBird_ERC20V2 is BlueBird_ERC20 {
   ///@dev increments the slices when called
   function getCap() public view override returns(uint) {
       return 1;
   }

   ///@dev returns the contract version
   function newTestV2() public pure returns (uint256) {
       return 2;
   }
}