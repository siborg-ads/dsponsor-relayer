import { Network } from "alchemy-sdk";

const config = {
  // ethereum (for ENS)
  1: {
    chainName: "ethereum",
    network: Network.ETH,
    rpcURL: "https://ethereum-rpc.publicnode.com"
  },

  // base-sepolia
  84532: {
    chainName: "base-sepolia",
    network: Network.BASE_SEPOLIA,

    appURL: "https://app.dsponsor.com",
    creditsURL: "https://dsponsor.com",
    explorerURL: "https://sepolia.basescan.org/",
    relayerURL: process.env.NEXT_DEV_URL
      ? process.env.NEXT_DEV_URL
      : "https://relayer.dsponsor.com",
    rpcURL: "https://sepolia.base.org",
    subgraphURL: "https://api.studio.thegraph.com/proxy/65744/dsponsor-base-sepolia/version/latest",

    smartContracts: {
      DSPONSOR_ADMIN: {
        address: "0x5cF7F046818E5Dd71bd3E004f2040E0e3C59467D",
        feeBps: "400"
      },
      DSPONSOR_MARKETPLACE: {
        address: "0xdf42633BD40e8f46942e44a80F3A58d0Ec971f09",
        feeBps: "400",
        minimalBidBps: "1000",
        previousBidAmountBps: "500"
      },
      UNISWAP_QUOTER: {
        address: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27"
      },
      NATIVE: {
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        symbol: "ETH"
      },
      WNATIVE: {
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH"
      },
      USDC: {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        decimals: 6,
        symbol: "USDC"
      },
      WETH: {
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH"
      }
    }
  },

  // sepolia
  11155111: {
    chainName: "sepolia",
    network: Network.ETH_SEPOLIA,

    appURL: "https://app.dsponsor.com",
    creditsURL: "https://dsponsor.com",
    explorerURL: "https://sepolia.etherscan.io",
    relayerURL: process.env.NEXT_DEV_URL
      ? process.env.NEXT_DEV_URL
      : "https://relayer.dsponsor.com",
    rpcURL: "https://ethereum-sepolia-rpc.publicnode.com",
    subgraphURL: "https://api.studio.thegraph.com/proxy/65744/dsponsor-sepolia/version/latest",

    smartContracts: {
      DSPONSOR_ADMIN: {
        address: "0x22554D70702C60A5fa30297908005B6cE19eEf51",
        feeBps: "400"
      },
      DSPONSOR_MARKETPLACE: {
        address: "0xd36097D256F31F1BF5aa597dA7C3E098d466aD13",
        feeBps: "400",
        minimalBidBps: "1000",
        previousBidAmountBps: "500"
      },
      UNISWAP_QUOTER: {
        address: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3"
      },
      NATIVE: {
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        symbol: "ETH"
      },
      WNATIVE: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18,
        symbol: "WETH"
      },
      USDC: {
        address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        decimals: 6,
        symbol: "USDC"
      },
      WETH: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18,
        symbol: "WETH"
      }
    }
  }
};

export default config;
