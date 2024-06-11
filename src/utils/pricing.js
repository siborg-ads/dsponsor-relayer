import config from "@/config";
import { getEthQuote } from "@/queries/uniswap/quote";
import { priceFormattedForAllValuesObject } from "@/utils/string";
import { ethers, getAddress, parseUnits } from "ethers";
import ERC20 from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json";

const memoize = {};

export const getCurrencyInfos = async (chainId, currency) => {
  let decimals = memoize[currency]?.decimals || undefined;
  let symbol = memoize[currency]?.symbol || undefined;

  if (
    memoize[currency] &&
    memoize[currency].lastFetchTimestamp &&
    memoize[currency].lastFetchTimestamp > Date.now() - 1000 * 60 * 5 // 5 minutes
  ) {
    return memoize[currency];
  }

  if (!decimals || !symbol) {
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

        decimals = await ERC20Contract.decimals.call();
        symbol = await ERC20Contract.symbol();
      } catch (e) {
        console.error("Error getting decimals and symbol", chainId, currency);
        decimals = BigInt("18");
        symbol = "";
      }
    }
  }

  const unit = parseInt(decimals.toString());

  const { amountUSDC, amountUSDCFormatted } = await getEthQuote(
    chainId,
    currency,
    parseUnits("1", unit).toString(), //   "1000000",
    0.3
  );

  memoize[currency] = {
    decimals,
    symbol,
    priceUSDC: amountUSDC.toString(),
    priceUSDCFormatted: amountUSDCFormatted,
    lastFetchTimestamp: Date.now()
  };
  return memoize[currency];
};

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
