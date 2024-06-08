import * as numeral from "numeral";
import config from "@/config";
import { getEthQuote } from "@/queries/uniswap/quote";
import { ethers, formatUnits, getAddress, parseUnits } from "ethers";
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
    res[key] = (BigInt(priceUSDC) * BigInt(obj[key])) / parseUnits("1", decimals);
  }

  return priceFormattedForAllValuesObject(6, res);
};

export const priceFormattedForAllValuesObject = (decimals = 18, obj) => {
  const res = {};
  const objKeys = Object.keys(obj);

  for (const key of objKeys) {
    if (obj[key] && obj[key].length) {
      let formatted = formatUnits(obj[key], decimals);
      res[key] = formatted;

      try {
        let formattedNb = numeral(formatted).value();
        if (formattedNb < 0.001 && formattedNb > 0) {
          const [, precision] = formatted.split(".");
          const precisionSplit = precision.split("");
          let firstNonZeroIndex = precisionSplit.findIndex((x) => x !== "0");
          let nonZeroNb = Number(precisionSplit[firstNonZeroIndex]);
          const nextNonZeroNb = nonZeroNb ? Number(precisionSplit[firstNonZeroIndex + 1]) : 0;
          let lastNumber;

          if (nonZeroNb === 9 && nextNonZeroNb > 5) {
            firstNonZeroIndex -= 1;
            lastNumber = 1;
          } else {
            lastNumber =
              nextNonZeroNb > 5
                ? Number(precisionSplit[firstNonZeroIndex]) + 1
                : Number(precisionSplit[firstNonZeroIndex]);
          }

          res[`${key}`] = `0.0${toSubscript(firstNonZeroIndex)}${lastNumber}`;
        } else if (formattedNb >= 0.001 && formattedNb < 0.1) {
          res[`${key}`] = numeral(formatted).format("0.[000]");
        } else if (formattedNb >= 0.1 && formattedNb < 1000) {
          res[`${key}`] = numeral(formatted).format("0.[00]");
        } else {
          res[`${key}`] = numeral(formatted).format("0.[0]a").toLocaleUpperCase();
        }
      } catch (e) {
        console.error("error formatting ", formatted, e);
      }
    }
  }
  return res;
};

export const priceFormatted = (decimals, amount) => {
  return formatUnits(amount, decimals);
};

const subscriptMap = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉"
};

function toSubscript(num) {
  if (num.toString().length === 1) {
    if (num === 2) {
      return "0"; // "0.000996666" should become "0.001"
    } else {
      return subscriptMap[num];
    }
  } else {
    return num
      .toString()
      .split("")
      .map((char) => subscriptMap[char] || char)
      .join("");
  }
}
