//const { network } = require("hardhat")
const { ethers, upgrades } = require('hardhat');
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    console.log(chainId)
    let maticUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        maticUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeed"]
    }
    //const BlueBird = await ethers.getContractFactory("BlueBird")
    //const proxy = await upgrades.deployProxy(BlueBird, [42], { initializer: 'store' })
    
    log("----------------------------------------------------")
    log("Deploying BlueBird and waiting for confirmations...")
    const token = await deploy("BlueBird", {
        from: deployer,
        args: [maticUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`BlueBird deployed at ${token.address}`)
    
    if (!developmentChain.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        await verify(token.address, [maticUsdPriceFeedAddress])

    }
}

module.exports.tags = ["all", "token"]