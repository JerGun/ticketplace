require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");
const mnemonic = process.env.MNEMONIC;

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    testnet: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://data-seed-prebsc-1-s1.binance.org:8545`
        ),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "0.8.11",
      // docker: true,
      // settings: {
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
