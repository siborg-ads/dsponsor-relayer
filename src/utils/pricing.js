import config from "@/config";
import { getEthQuote } from "@/queries/uniswap/quote";
import { priceFormattedForAllValuesObject } from "@/utils/string";
import { ethers, getAddress, parseUnits } from "ethers";
import { memoize } from "nextjs-better-unstable-cache";
import ERC20 from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json";

export const getCurrencyInfos = memoize(_getCurrencyInfos, {
  revalidateTags: ["cron"],
  log: process.env.NEXT_CACHE_LOGS ? process.env.NEXT_CACHE_LOGS.split(",") : []
});

async function _getCurrencyInfos(chainId, currency) {
  let decimals, symbol;

  const { smartContracts } = config[chainId] || {};
  const smartContractKeys = Object.keys(smartContracts);
  const currencyKey = smartContractKeys.find(
    (s) => getAddress(smartContracts[s].address) === getAddress(currency)
  );

  if (currencyKey) {
    decimals = smartContracts[currencyKey].decimals;
    symbol = smartContracts[currencyKey].symbol;
  } else {
    try {
      const rpcURL = config?.[chainId]?.rpcURL;
      const provider = new ethers.JsonRpcProvider(rpcURL);
      const signer = ethers.Wallet.createRandom().connect(provider);
      const ERC20Contract = new ethers.Contract(currency, ERC20.abi, signer);

      [decimals, symbol] = await Promise.all(ERC20Contract.decimals.call(), ERC20Contract.symbol());
    } catch (e) {
      console.error("Error getting decimals and symbol", chainId, currency);
      decimals = BigInt("18");
      symbol = "";
    }
  }

  const unit = parseInt(decimals.toString());

  const { amountUSDC, amountUSDCFormatted } = await getEthQuote(
    chainId,
    currency,
    parseUnits("1", unit).toString(), //   "1000000",
    0.3
  );

  return {
    _lastUpdate: new Date().toJSON(),
    decimals,
    symbol,
    priceUSDC: amountUSDC.toString(),
    priceUSDCFormatted: amountUSDCFormatted
  };
}

export const priceUsdcFormattedForAllValuesObject = async (chainId, obj, currency) => {
  const { decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);

  const res = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      try {
        res[key] = (BigInt(priceUSDC) * BigInt(obj[key])) / parseUnits("1", decimals);
      } catch (e) {
        // console.error("error formatting ", obj[key], e);
      }
    }
  }

  return priceFormattedForAllValuesObject(6, res);
};
