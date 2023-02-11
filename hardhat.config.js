require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy");
require('dotenv').config()

const { COINMARKETCAP_API_KEY, POLYGON_MAINNET_RPC_URL, PRIVATE_KEY, POLYGONSCAN_API_KEY, MUMBAI_RPC_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // multiple solidity version:
  solidity: {
    compilers: [ {version: "0.6.6"}, {version: "0.8.9"} ],
  },
  defaultNetwork: "hardhat",
  networks:{
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000
    },
    mumbai:{
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      blockConfermation: 6,
      allowUnlimitedContractSize: true,
      callbackGasLimit: "500000"
    },
    polygon:{
      url: POLYGON_MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      blockConfermation: 6,
      allowUnlimitedContractSize: true,
      callbackGasLimit: "500000"
    }
  },
  gasReporter: {
    enabled: false, //impostando a true per avere i dati
    outputFile: "gas-report.txt",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
    currency:"USD"
  },
  etherscan:{
    apiKey: POLYGONSCAN_API_KEY,
  },
  namedAccounts:{
    deployer: {
      default: 0,
      31337: 1,
    },
    user:{
      default: 1,
    }
  },
};
