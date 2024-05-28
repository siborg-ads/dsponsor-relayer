import { Network } from "alchemy-sdk";

const config = {
  // sepolia
  11155111: {
    chainName: "sepolia",
    network: Network.ETH_SEPOLIA,
    subgraphURL: "https://api.studio.thegraph.com/proxy/65744/dsponsor-sepolia/version/latest",
    appURL: "https://app.staging.dsponsor.com",
    assetsURL: "https://relayer.dsponsor.com",
    creditsURL: "https://dsponsor.com",
    explorerURL: "https://sepolia.etherscan.io",
    rpcURL: "https://ethereum-sepolia-rpc.publicnode.com",
    smartContracts: {
      DSPONSOR_ADMIN: {
        address: "0xE442802706F3603d58F34418Eac50C78C7B4E8b3",
        feeBps: "400"
      },
      DSPONSOR_MARKETPLACE: {
        address: "0xac03b675fa9644279b92f060bf542eed54f75599",
        feeBps: "400",
        minimalBidBps: "1000",
        previousBidAmountBps: "500"
      },
      WNATIVE: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18
      },
      USDC: {
        address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        decimals: 6
      },
      WETH: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18
      },
      UNISWAP_QUOTER: {
        address: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3"
      }
    }
  }
};

export default config;
