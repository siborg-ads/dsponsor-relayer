import config from "@/config";
import { getEthQuote } from "@/queries/uniswap/quote";
import { ethers, getAddress, parseUnits } from "ethers";
import ERC20 from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json";
import usdPrices from "@/data/usdPrices.json";

const memoize = {};

export async function fetchHistoricalPrice(coingeckoId, date) {
  if (coingeckoId === "usd") return 1;
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${date}&localization=false`,
      {
        headers: {
          method: "GET",
          "Content-Type": "application/json",
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          next: { tags: [`pricing-${coingeckoId}-${date}`] }
          // cache: "force-cache"
        }
      }
    );
    const json = await res.json();

    return json.market_data.current_price.usd;
  } catch (e) {
    console.error(`Coingecko error ${coingeckoId}-${date}`, e);
    return 0;
  }
}

export const getCurrencyInfos = async (chainId, currency) => {
  let decimals = memoize[currency]?.decimals || undefined;
  let symbol = memoize[currency]?.symbol || undefined;
  let coingeckoId = memoize[currency]?.coingeckoId || undefined;

  /*
  const supportedCurrencies = Object.keys(config?.[chainId]?.smartContracts).map((key) =>
    getAddress(config?.[chainId]?.smartContracts[key]?.address)
  );
  */

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
      coingeckoId = smartContracts[currencyKey].coingeckoId;
    } else {
      /*
      if (!supportedCurrencies.includes(getAddress(currency))) {
        //console.log("Currency not supported", chainId, currency);
        decimals = BigInt("18");
        symbol = "";
      } else {
        */
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
      // }
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
    coingeckoId,
    decimals,
    symbol,
    priceUSDC: amountUSDC.toString(),
    priceUSDCFormatted: amountUSDCFormatted,
    lastFetchTimestamp: Date.now()
  };
  return memoize[currency];
};

export const getCurrencyInfosAtBlocktimestamp = async (chainId, currency, blockTimestamp) => {
  const date = new Date(blockTimestamp * 1000);

  const { symbol, decimals, coingeckoId } = await getCurrencyInfos(chainId, currency);
  let priceUSD = 0;

  if (coingeckoId) {
    priceUSD =
      usdPrices[coingeckoId]?.[`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`];

    if (!priceUSD) {
      priceUSD = await fetchHistoricalPrice(
        coingeckoId,
        `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
      );
    }
  }

  return {
    decimals,
    symbol,
    priceUSDC: parseFloat(priceUSD * 1000000).toFixed(0),
    priceUSDCFormatted: priceUSD,
    lastFetchTimestamp: date
  };
};

export const priceUsdcForAllValuesObject = async (chainId, obj, currency) => {
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

  return res;
};
