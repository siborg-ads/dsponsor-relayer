import config from "@/config";
import { priceFormattedForAllValuesObject } from "@/utils/string";
import { Transaction, ethers, getAddress } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

export const getEthQuote = async (chainId, tokenOutAddr, amountOut, slippagePerCent = 0.3) => {
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
      const from = await signer.getAddress();
      // "0x6aabdd49a7f97f5242fd0fd6938987e039827666" // forta block
      // "0x098b716b8aaf21512996dc57eb0615e2383e2f96" // ofac blocked
      const quoterContract = new ethers.Contract(uniswapV3QuoterAddr, Quoter.abi, signer);

      const ethQuotePayload = {
        tokenIn: WNATIVE_ADDR,
        tokenOut: tokenOutAddr,
        fee: 3000,
        amount: amountOut,
        sqrtPriceLimitX96: 0
      };

      // Check if the transaction will be secure
      // we activated Uniswap trade slippage thresold, Forta Scam & OFAC policies
      try {
        const tx = await quoterContract.quoteExactOutputSingle.populateTransaction(
          ethQuotePayload,
          {
            chainId,
            value: 0
          }
        );

        const serializedTx = Transaction.from(tx).unsignedSerialized;
        const params = [serializedTx, from];

        const rpcResponse = await provider.send("eth_simulateTransaction", params);
        shield3Decisions = rpcResponse?.transaction?.decisionReasons;
      } catch {
        //
      }

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
