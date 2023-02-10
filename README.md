Per il deploy: 
 - mettere in env
 - mettere in env le password necessarie
 - mettere in env la key di polygonscan

TODO: 
 - readme
 - deploy
 - git proget

# BlueBird
This folder is refered to BlueBird (BBD) ERC20. 
The contract are update form the address `0x` to:
 - Test Mumbai: `0x`
 - Polygon Mainnet: `0x`

## Mint & distribution
The capitaze of this token is 1000000000 and is divide in: 
 - 58% ecosystem 
 - 24% marketing & investiment
 - 8% founders
 - 10% consoulting & growth
The ecosystem part is minted in 3 step: 
 - 25% (of the total cap) price: 0.008$
 - 15% (of the total cap) price: 0.01$
 - 18% (of the total cap) price: 0.02$

## Evolution
The creation of BlueBird token is just the first step of a major program. In this project will be create an NFT gallery used for a specific game. For futher information reading the whitepaper or consult the website.

## Create a local instance of this progect
Onces cloned the project in a local folder. Download and Install npm and yarn.
Now follow this step:
```
yarn install
```

hardhat standard comand:
```
yarn hardhat clean
yarn hardhat compile
yarn hardhat test .\test\test.unit.BlueBird.js --network hardhat
yarn hardhat deploy --network hardhat --tags all
```