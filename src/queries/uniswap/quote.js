import config from "@/config";
import { priceFormattedForAllValuesObject } from "@/utils/string";
import { Transaction, ethers, getAddress, isAddress } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

export const getEthQuote = async (
  chainId,
  tokenOutAddr,
  amountOut,
  slippagePerCent = 0.3,
  shield3Check = false,
  recipient
) => {
  const uniswapV3QuoterAddr = config?.[chainId]?.smartContracts?.UNISWAP_QUOTER?.address;
  const WNATIVE_ADDR = config?.[chainId]?.smartContracts?.WNATIVE?.address;
  const USDC_ADDR = config?.[chainId]?.smartContracts?.USDC?.address;
  const rpcURL = config?.[chainId]?.rpcURL;

  const supportedCurrencies = Object.keys(config?.[chainId]?.smartContracts).map((key) =>
    getAddress(config?.[chainId]?.smartContracts[key]?.address)
  );

  let amountInEth = "0";
  let amountInEthWithSlippage = "0";
  let amountUSDC = "0";
  let shield3Decisions = [];

  try {
    if (tokenOutAddr === "0x0000000000000000000000000000000000000000") {
      tokenOutAddr = WNATIVE_ADDR;
    }

    tokenOutAddr = getAddress(tokenOutAddr);

    if (slippagePerCent < 0.01 || slippagePerCent > 100) slippagePerCent = 0.3;

    if (supportedCurrencies.includes(tokenOutAddr)) {
      const provider = new ethers.JsonRpcProvider(rpcURL);
      const signer = ethers.Wallet.createRandom().connect(provider);

      const quoterContract = new ethers.Contract(uniswapV3QuoterAddr, Quoter.abi, signer);

      const ethQuotePayload = {
        tokenIn: WNATIVE_ADDR,
        tokenOut: tokenOutAddr,
        fee: 3000,
        amount: amountOut,
        sqrtPriceLimitX96: 0
      };

      [amountInEth] =
        tokenOutAddr == WNATIVE_ADDR
          ? [BigInt(amountOut.toString())]
          : await quoterContract.quoteExactOutputSingle.staticCall(ethQuotePayload);

      [amountUSDC] = await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn: WNATIVE_ADDR,
        tokenOut: USDC_ADDR,
        fee: 3000,
        amountIn: amountInEth,
        sqrtPriceLimitX96: 0
      });

      const slippageMul = 10000;
      const slippage = slippageMul + (slippagePerCent * slippageMul) / 100;

      amountInEthWithSlippage =
        tokenOutAddr == WNATIVE_ADDR
          ? amountInEth
          : (amountInEth * BigInt(slippage.toString())) / BigInt(slippageMul.toString());

      if (shield3Check) {
        try {
          // Check if the transaction will be secure
          // - we activated Uniswap trade slippage & amounts thresolds + OFAC policies
          // - it does not work with ERC20 value & uniswap slippage
          //
          // TEST values:
          // recipient = "0x6aabdd49a7f97f5242fd0fd6938987e039827666" // forta block
          // recipient = "0x098b716b8aaf21512996dc57eb0615e2383e2f96"; // ofac blocked

          const swapRouterABI = [
            {
              inputs: [
                {
                  components: [
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "address", name: "recipient", type: "address" },
                    { internalType: "uint256", name: "amountOut", type: "uint256" },
                    { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
                    { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" }
                  ],
                  internalType: "struct IV3SwapRouter.ExactOutputSingleParams",
                  name: "params",
                  type: "tuple"
                }
              ],
              name: "exactOutputSingle",
              outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
              stateMutability: "payable",
              type: "function"
            }
          ];
          const swapRouterAddr = config?.[chainId]?.smartContracts?.UNISWAP_SWAP_ROUTER?.address;
          const shield3RpcUrl = config?.[chainId]?.shield3RpcURL;
          const shield3Provider = new ethers.JsonRpcProvider(shield3RpcUrl);
          const shield3Signer = ethers.Wallet.createRandom().connect(shield3Provider);

          const swapRouterContract = new ethers.Contract(
            swapRouterAddr,
            swapRouterABI,
            shield3Signer
          );

          recipient = isAddress(recipient) ? recipient : await shield3Signer.getAddress();

          const tx = await swapRouterContract.exactOutputSingle.populateTransaction(
            {
              tokenIn: WNATIVE_ADDR,

              // trick: if tokenOut is WETH, there is a wrap instead of swap,
              // we use USDC to have low probability to have slippage issue
              tokenOut: tokenOutAddr == WNATIVE_ADDR ? tokenOutAddr : USDC_ADDR,

              fee: 3000,
              recipient,
              amountOut: amountUSDC,
              amountInMaximum: amountInEthWithSlippage,
              sqrtPriceLimitX96: 0
            },
            {
              chainId,
              value: amountInEthWithSlippage
            }
          );

          const serializedTx = Transaction.from(tx).unsignedSerialized;
          const params = [serializedTx, recipient];

          const rpcResponse = await shield3Provider.send("eth_simulateTransaction", params);
          shield3Decisions = rpcResponse?.transaction?.decisionReasons;
        } catch (e) {
          //  console.error("Shield3 error", e);
        }
      }
    }
  } catch (e) {
    console.error("Quote error", chainId, tokenOutAddr, amountOut, slippagePerCent);
  }

  const {
    amountInEth: amountInEthFormatted,
    amountInEthWithSlippage: amountInEthWithSlippageFormatted
  } = priceFormattedForAllValuesObject(18, { amountInEth, amountInEthWithSlippage });

  const { amountUSDC: amountUSDCFormatted } = priceFormattedForAllValuesObject(6, { amountUSDC });

  return {
    amountInEth: amountInEth.toString(),
    amountInEthWithSlippage: amountInEthWithSlippage.toString(),
    amountUSDC: amountUSDC.toString(),
    amountInEthFormatted,
    amountInEthWithSlippageFormatted,
    amountUSDCFormatted,
    shield3Decisions
  };
};
