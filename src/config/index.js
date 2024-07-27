import { Network } from "alchemy-sdk";

const config = {
  // ethereum (for ENS)
  1: {
    chainName: "ethereum",
    network: Network.ETH,
    rpcURL: "https://ethereum-rpc.publicnode.com",
    shield3RpcURL:
      "https://rpc.shield3.com/v3/ethereum-mainnet/rzRHl7c0292FDuzuI6kTp6CYYrpSpSFZ7i5DMLzm/rpc",

    smartContracts: {
      UNISWAP_QUOTER: {
        address: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
      },
      UNISWAP_SWAP_ROUTER: {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
      },
      NATIVE: {
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        symbol: "ETH"
      },
      WNATIVE: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        symbol: "WETH"
      },
      UNI: {
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        decimals: 18,
        symbol: "UNI"
      },
      USDC: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        symbol: "USDC"
      },
      WETH: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        symbol: "WETH",
        isProtocolFeeCurrency: true
      }
    }
  },

  // base
  8453: {
    chainName: "base",
    network: Network.BASE_MAINNET,

    appURL: "https://app.dsponsor.com",
    creditsURL: "https://dsponsor.com",
    explorerURL: "https://basescan.org",
    relayerURL: process.env.NEXT_DEV_URL
      ? process.env.NEXT_DEV_URL
      : "https://relayer.dsponsor.com",
    rpcURL: "https://mainnet.base.org",
    shield3RpcURL:
      "https://rpc.shield3.com/v3/base-mainnet/rzRHl7c0292FDuzuI6kTp6CYYrpSpSFZ7i5DMLzm/rpc",
    subgraphURL: `https://subgraph.satsuma-prod.com/${process.env.SUBGRAPH_ALCHEMY_KEY}/dsponsors-team--672881/dsponsor-subgraph/api`,
    // `https://gateway-arbitrum.network.thegraph.com/api/${process.env.THEGRAPH_API_KEY}/subgraphs/id/5VzXGF3GZBgtDcbMik1t9HgzNxL4do69ozgiJfMEFBSN`,

    smartContracts: {
      DSPONSOR_ADMIN: {
        address: "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
        feeBps: "400"
      },
      DSPONSOR_MARKETPLACE: {
        address: "0x86aDf604B5B72d270654F3A0798cabeBC677C7fc",
        feeBps: "400",
        minimalBidBps: "1000",
        previousBidAmountBps: "500"
      },
      UNISWAP_QUOTER: {
        address: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
      },
      UNISWAP_SWAP_ROUTER: {
        address: "0x2626664c2603336E57B271c5C0b26F421741e481"
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
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        symbol: "USDC"
      },
      WETH: {
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH",
        isProtocolFeeCurrency: true
      }
    }
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
    shield3RpcURL:
      "https://rpc.shield3.com/v3/base-sepolia/rzRHl7c0292FDuzuI6kTp6CYYrpSpSFZ7i5DMLzm/rpc",
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
      UNISWAP_SWAP_ROUTER: {
        address: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4"
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
        symbol: "WETH",
        isProtocolFeeCurrency: true
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
    shield3RpcURL:
      "https://rpc.shield3.com/v3/sepolia/rzRHl7c0292FDuzuI6kTp6CYYrpSpSFZ7i5DMLzm/rpc",
    subgraphURL: "https://api.studio.thegraph.com/proxy/65744/dsponsor-sepolia/version/latest",

    smartContracts: {
      DSPONSOR_ADMIN: {
        address: "0x10E0447dDB66f1d33E6b10dB5099FBa231ceCE5C",
        feeBps: "400"
      },
      DSPONSOR_MARKETPLACE: {
        address: "0x0B7f100940f4152D01B42A626ab73f7A62dd7cdC",
        feeBps: "400",
        minimalBidBps: "1000",
        previousBidAmountBps: "500"
      },
      UNISWAP_QUOTER: {
        address: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3"
      },
      UNISWAP_SWAP_ROUTER: {
        address: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"
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
      UNI: {
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        decimals: 18,
        symbol: "UNI"
      },
      USDC: {
        address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        decimals: 6,
        symbol: "USDC"
      },
      WETH: {
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18,
        symbol: "WETH",
        isProtocolFeeCurrency: true
      }
    }
  }
};

export default config;
