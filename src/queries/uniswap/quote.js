import config from "@/config";
import { ethers } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

const { formatUnits } = ethers;

export const getEthQuote = async (chainId, tokenOutAddr, amountOut, slippagePerCent = 0.3) => {
  const uniswapV3QuoterAddr = config?.[chainId]?.smartContracts?.UNISWAP_QUOTER?.address;
  const WETH_ADDR = config?.[chainId]?.smartContracts?.WETH?.address;
  const USDC_ADDR = config?.[chainId]?.smartContracts?.USDC?.address;
  const rpcURL = config?.[chainId]?.rpcURL;

  let amountInEth = "0";
  let amountInEthWithSlippage = "0";
  let amountUSDC = "0";

  try {
    if (tokenOutAddr === "0x0000000000000000000000000000000000000000") {
      tokenOutAddr = config?.[chainId]?.smartContracts?.WNATIVE?.address || WETH_ADDR;
    }

    if (slippagePerCent < 0.01 || slippagePerCent > 100) slippagePerCent = 0.3;

    const provider = new ethers.JsonRpcProvider(rpcURL);
    const signer = ethers.Wallet.createRandom().connect(provider);

    const quoterContract = new ethers.Contract(uniswapV3QuoterAddr, Quoter.abi, signer);

    [amountInEth] =
      tokenOutAddr === WETH_ADDR || tokenOutAddr === "0x0000000000000000000000000000000000000000"
        ? [BigInt(amountOut.toString())]
        : await quoterContract.quoteExactOutputSingle.staticCall({
            tokenIn: WETH_ADDR,
            tokenOut: tokenOutAddr,
            fee: 3000,
            amount: amountOut,
            sqrtPriceLimitX96: 0
          });

    [amountUSDC] = await quoterContract.quoteExactInputSingle.staticCall({
      tokenIn: WETH_ADDR,
      tokenOut: USDC_ADDR,
      fee: 3000,
      amountIn: amountInEth,
      sqrtPriceLimitX96: 0
    });

    const slippageMul = 10000;
    const slippage = slippageMul + (slippagePerCent * slippageMul) / 100;

    amountInEthWithSlippage =
      (amountInEth * BigInt(slippage.toString())) / BigInt(slippageMul.toString());
  } catch (e) {
    console.error("Quote error", chainId, tokenOutAddr, amountOut, slippagePerCent);
  }

  return {
    amountInEth: amountInEth.toString(),
    amountInEthWithSlippage: amountInEthWithSlippage.toString(),
    amountUSDC: amountUSDC.toString(),
    amountInEthFormatted: formatUnits(amountInEth, 18),
    amountInEthWithSlippageFormatted: formatUnits(amountInEthWithSlippage, 18),
    amountUSDCFormatted: formatUnits(amountUSDC, 6)
  };
};
