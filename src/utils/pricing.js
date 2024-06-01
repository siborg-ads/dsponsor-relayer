import * as numeral from "numeral";
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
