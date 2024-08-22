import {
  formatUnits,
  // ethers,
  getAddress
} from "ethers";
import config from "@/config";
import { getAllOffers, getHolders, getSpendings } from "@/queries/activity";
import { priceFormattedForAllValuesObject } from "@/utils/string";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request, context) {
  const { chainId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const fromTimestamp = searchParams.get("fromTimestamp");
  const toTimestamp = searchParams.get("toTimestamp");
  const userAddress = searchParams.get("userAddress")
    ? getAddress(searchParams.get("userAddress"))
    : null;
  const nftContractAddress = searchParams.get("nftContractAddress");

  // const provider = new ethers.JsonRpcProvider(config[1].rpcURL); // ethereum RPC for ENS

  let nftContractAddresses = [];
  if (!nftContractAddress) {
    const allOffers = await getAllOffers(chainId);
    nftContractAddresses = allOffers.map((offer) => offer.nftContract.id);
  } else {
    nftContractAddresses = nftContractAddress.split(",");
  }

  const [holders, { lastBid, totalBids, spendings, protocolFees, protocolFeeCurrency }] =
    await Promise.all([
      getHolders(chainId, nftContractAddresses, userAddress),
      getSpendings(chainId, nftContractAddress, userAddress, fromTimestamp, toTimestamp)
    ]);

  const result = {};

  const setupResultAddr = (addr) => {
    if (!result[addr]) {
      result[addr] = {
        addr,
        balance: 0,
        //
        nbBids: 0,
        nbRefunds: 0,
        nbProtocolFeeBuys: 0,
        nbProtocolFeeSells: 0,
        nbProtocolFeeReferrals: 0,
        usdcAmounts: {
          // total USDC
          totalSpent: BigInt("0"),
          totalReceived: BigInt("0"),
          bidSpent: BigInt("0"),
          bidRefundReceived: BigInt("0"),
          totalProtocolFee: BigInt("0")
        }
      };
    }
  };

  for (const userAddr of Object.keys(holders)) {
    const addr = getAddress(userAddr);
    setupResultAddr(addr);
    result[addr].balance = holders[userAddr];
  }

  for (const userAddr of Object.keys(spendings)) {
    const addr = getAddress(userAddr);
    setupResultAddr(addr);
    result[addr] = Object.assign(result[addr], spendings[userAddr]);
  }

  const smartContractsAddresses = Object.keys(config[chainId].smartContracts).map((k) =>
    getAddress(config[chainId].smartContracts[k].address)
  );

  let resultArray = Object.keys(result)
    .map((key) => result[key])
    .filter((e) => {
      const isSCAddr = smartContractsAddresses.includes(e.addr);
      const isExcludedRankAddress = [
        "0x9a7FAC267228f536A8f250E65d7C4CA7d39De766",
        "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf"
      ].includes(e.addr);
      const filterByUser = userAddress ? e.addr == userAddress : true;

      return !isSCAddr && !isExcludedRankAddress && filterByUser;
    });

  resultArray = resultArray
    .sort((a, b) => b.balance - a.balance)
    .map((e, i) => ({ ...e, holdersRank: i + 1 }));

  resultArray = resultArray
    .sort((a, b) => {
      if (a.usdcAmounts.totalSpent > b.usdcAmounts.totalSpent) {
        return -1;
      }
      if (a.usdcAmounts.totalSpent < b.usdcAmounts.totalSpent) {
        return 1;
      }
      return 0;
    })
    .map((e, i) => ({ ...e, spendersRank: i + 1 }));

  resultArray = resultArray
    .sort((a, b) => {
      if (a.usdcAmounts.bidRefundReceived > b.usdcAmounts.bidRefundReceived) {
        return -1;
      }
      if (a.usdcAmounts.bidRefundReceived < b.usdcAmounts.bidRefundReceived) {
        return 1;
      }
      return 0;
    })
    .map((e, i) => ({ ...e, bidRefundsRank: i + 1 }));

  const valueToPoints = (value, currency) => {
    // WETH ; decimals = 18 ; we want 1 WETH = 1000 points

    const points =
      value && currency == protocolFeeCurrency.address
        ? Number(formatUnits(value.toString(), 13))
        : 0;

    return points > 1 ? Number(points.toFixed(0)) : points;
  };

  resultArray = resultArray
    .sort((a, b) => {
      const aAmount =
        a?.currenciesAmounts?.[protocolFeeCurrency.address]?.totalProtocolFee || BigInt("0");
      const bAmount =
        b?.currenciesAmounts?.[protocolFeeCurrency.address]?.totalProtocolFee || BigInt("0");

      if (aAmount > bAmount) {
        return -1;
      }
      if (aAmount < bAmount) {
        return 1;
      }
      return 0;
    })
    .map((e, i) => {
      const totalProtocolFee =
        e?.currenciesAmounts?.[protocolFeeCurrency.address]?.totalProtocolFee || BigInt("0");
      const points = valueToPoints(totalProtocolFee, protocolFeeCurrency.address);

      return { points, ...e, totalProtocolFeeRank: i + 1 };
    });
  /*
  Above includes WETH only, 
    PREVIOUS VERSION : include all currencies, total can change at anytime according to coin prices
  .sort((a, b) => {
      if (a.usdcAmounts.totalProtocolFee > b.usdcAmounts.totalProtocolFee) {
        return -1;
      }
      if (a.usdcAmounts.totalProtocolFee < b.usdcAmounts.totalProtocolFee) {
        return 1;
      }
      return 0;
    })
      .map((e, i) => ({ ...e, totalProtocolFeeRank: i + 1 })
    */

  let nbHolders = 0;
  let nbRevenueCalls = 0;
  let totalSpentUSDCAmount = BigInt("0");
  let totalBidRefundUSDCAmount = BigInt("0");
  let totalProtocolRevenueUSDCAmount = BigInt("0");

  resultArray = await Promise.all(
    resultArray.map(async (e) => {
      // e.ens = await provider.lookupAddress(e.addr);
      e.displayAddr = e.addr.slice(0, 6) + "..." + e.addr.slice(-4);
      if (e.balance > 0) nbHolders += 1;
      totalSpentUSDCAmount += e.usdcAmounts.totalSpent;
      totalBidRefundUSDCAmount += e.usdcAmounts.bidRefundReceived;
      const negativeToZero = true;
      e.usdcAmounts = priceFormattedForAllValuesObject(6, e.usdcAmounts, negativeToZero);
      return e;
    })
  );

  lastBid.bidderAddr = lastBid.bidderAddr ? getAddress(lastBid.bidderAddr) : null;
  const lastBidderEns = lastBid.bidderAddr
    ? // ? await provider.lookupAddress(lastBid.bidderAddr)
      lastBid.bidderAddr
    : null;
  const lastBidderDisplayAddr = lastBidderEns
    ? lastBidderEns
    : lastBid.bidderAddr.slice(0, 6) + "..." + lastBid.bidderAddr.slice(-4);

  const lastActivities = Object.values(protocolFees)

    .sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    .map((e) => {
      nbRevenueCalls += 1;
      totalProtocolRevenueUSDCAmount += e.usdcAmount;
      e.points = valueToPoints(e.fee, e.currency);
      return { ...e, date: new Date(e.blockTimestamp * 1000) };
    });

  const response = JSON.stringify(
    {
      protocolFeeCurrency, // WETH
      totalBids,
      ...priceFormattedForAllValuesObject(6, {
        totalProtocolRevenueUSDCAmount,
        totalSpentUSDCAmount,
        totalBidRefundUSDCAmount
      }),
      nbRevenueCalls,
      nbHolders,
      lastBid: {
        ...lastBid,
        lastBidderDisplayAddr,
        date: new Date(lastBid.blockTimestamp * 1000)
      },
      lastActivities,
      rankings: resultArray
    },
    null,
    4
  );

  return new Response(response, {
    headers: {
      "content-type": "application/json"
    }
  });
}
