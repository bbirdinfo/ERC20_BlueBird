# BlueBird Token (BBD)

This repository contains the source code of BlueBird (BBD) ERC20 token Polygon. Note that the contract uses OpenZeppelin libraries and is upgradeable to ensure that it can follow the project's evolution in later stages.

## Introduction
The BBD token is an ERC20 token with a maximum of 1 billion units in circulation and is avaible on Polygon blockcahin. This document provides information on the token settings, distribution, and the contract's usage of OpenZeppelin libraries.

## Token Deployment Information
The BBD contract is deployed and owned by 0xBc6107fAcc388290833AB411CBa71D83BB9f3c93.
The BBD token contract has been deployed to Polygon blockchain ai seguenti indirizzi:
 - Test Mumbai: 0x56D58431190C86373056352e690e8322353a4055
 - Polygon Mainnet: 0x033Dc83A2a1de03252480D078A1C155c5f78ebBE

## Token Settings
The BBD token is identified by the following parameters:
 - Contract address: `0x033Dc83A2a1de03252480D078A1C155c5f78ebBE`
 - Symbol: `BBD`
 - Decimal: `18`
These parameters can be used to import the BBD token into any wallet.

## Token Distribution
The total token supply of BBD is 1 billion. The token distribution is as follows:
 - 58% ecosystem
 - 24% marketing & investment
 - 8% founders
 - 10% consulting & growth

The ecosystem part is minted in 3 steps:
 - 25% (of the total cap) price: 0.008$
 - 15% (of the total cap) price: 0.01$
 - 18% (of the total cap) price: 0.02$

## Future Developments
The creation of the BBD token is just the first step of a major program. In this project, an NFT gallery will be created and used for a specific game. For further information, please read the whitepaper or consult the website.
Local Deployment

To create a local instance of this project, clone the repository and download and install npm and yarn. Then, run the following commands:
```
yarn install
yarn hardhat clean
yarn hardhat compile
yarn hardhat test .\test\test.unit.BlueBird.js --network hardhat
yarn hardhat deploy --network hardhat --tags all
```

Please note that the contract owner and deployer is `0xBc6107fAcc388290833AB411CBa71D83BB9f3c93`.