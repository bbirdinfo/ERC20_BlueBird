const { ethers, upgrades } = require("hardhat");
const { developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()


const PROXY = "0x4420c9e1A606Bf311Afb6609E7B3C8830986D5c5";

async function main() {
 const BlueBird_ERC20V2 = await ethers.getContractFactory("BlueBird_ERC20V2");
 console.log("Upgrading v2...");
 const token = await upgrades.upgradeProxy(PROXY, BlueBird_ERC20V2);
 console.log("BlueBirdV2 upgraded successfully");

 if (!developmentChain.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
    await verify(token.address, [])
}
}

main();