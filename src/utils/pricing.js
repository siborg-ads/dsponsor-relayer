import config from "@/config";
import { ethers, formatUnits } from "ethers";
import ERC20 from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json";

const memoize = {};

export const getDecimalsAndSymbol = async (chainId, currency) => {
  let decimals, symbol;

  if (memoize[currency]) {
    return memoize[currency];
  }

  const { smartContracts } = config[chainId] || {};
  const smartContractKeys = Object.keys(smartContracts);
  const currencyKey = smartContractKeys.find(
    (s) => smartContracts[s].address.toLowerCase() === currency.toLowerCase()
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
  memoize[currency] = { decimals, symbol };
  return { decimals, symbol };
};

export const priceFormattedForAllValuesObject = (decimals = 18, obj) => {
  const res = {};
  const objKeys = Object.keys(obj);

  for (const key of objKeys) {
    res[key] = formatUnits(obj[key], decimals);
  }
  return res;
};

export const priceFormatted = (decimals, amount) => {
  return formatUnits(amount, decimals);
};
