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
    rpcURL: "https://ethereum-sepolia-rpc.publicnode.com",
    smartContracts: {
      WNATIVE: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
      },
      USDC: {
        address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"
      },
      WETH: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
      },
      UNISWAP_QUOTER: {
        address: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3"
      }
    }
  }
};

export default config;
