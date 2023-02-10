const networkConfig = {
    80001: {
        name: "Mumbai",
        /**
         * Network: Mumbai
         * Aggregator: Matic/USD
         * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
         */
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
    },
    137: {
        name: "Matic",
        /**
         * Network: Matic
         * Aggregator: Matic/USD
         * Address: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
         */
    
        maticUsdPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    },
    31337:{
        name: "localhost",
        maticUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
}

const developmentChain = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChain
}