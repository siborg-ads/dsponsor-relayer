import {
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
  const userAddress = searchParams.get("userAddress");
  const nftContractAddress = searchParams.get("nftContractAddress");

  const fetchOptions = {
    next: { revalidate }
  };

  // const provider = new ethers.JsonRpcProvider(config[1].rpcURL); // ethereum RPC for ENS

  let nftContractAddresses = [];
  if (!nftContractAddress) {
    const allOffers = await getAllOffers(fetchOptions, chainId);
    nftContractAddresses = allOffers.map((offer) => offer.nftContract.id);
  } else {
    nftContractAddresses = nftContractAddress.split(",");
  }

  const holders = await getHolders(chainId, nftContractAddresses, userAddress);
  const { lastBid, totalBids, spendings, protocolFees, fetchDate } = await getSpendings(
    fetchOptions,
    chainId,
    nftContractAddress,
    userAddress,
    fromTimestamp,
    toTimestamp
  );

  const result = {};

  const setupResultAddr = (addr) => {
    if (!result[addr]) {
      result[addr] = {
        addr,
        balance: 0,
        //
        nbBids: 0,
        nbWinningBids: 0,
        nbRefunds: 0,
        nbSoldBids: 0,
        nbBuys: 0,
        nbSoldBuys: 0,
        nbOffers: 0,
        nbSoldOffers: 0,
        nbMints: 0,
        nbSoldMint: 0,
        usdcAmounts: {
          // total USDC
          totalSpent: BigInt("0"),
          totalReceived: BigInt("0"),
          bidSpent: BigInt("0"),
          bidRefundReceived: BigInt("0"),
          bidReceived: BigInt("0"),
          buySpent: BigInt("0"),
          buyReceived: BigInt("0"),
          offerSpent: BigInt("0"),
          offerReceived: BigInt("0"),
          mintSpent: BigInt("0"),
          mintReceived: BigInt("0"),
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
    .filter((e) => !smartContractsAddresses.includes(e.addr));

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
    .sort((a, b) => b.usdcAmounts.bidRefundReceived > a.usdcAmounts.bidRefundReceived)
    .map((e, i) => ({ ...e, bidRefundsRank: i + 1 }));

  resultArray = resultArray
    .sort((a, b) => {
      if (a.usdcAmounts.totalProtocolFee > b.usdcAmounts.totalProtocolFee) {
        return -1;
      }
      if (a.usdcAmounts.totalProtocolFee < b.usdcAmounts.totalProtocolFee) {
        return 1;
      }
      return 0;
    })
    .map((e, i) => ({ ...e, totalProtocolFeeRank: i + 1 }));

  let nbHolders = 0;
  let nbRevenueCalls = 0;
  let totalSpentUSDCAmount = BigInt("0");
  let totalBidRefundUSDCAmount = BigInt("0");
  let totalProtocolRevenueUSDCAmount = BigInt("0");

  resultArray = await Promise.all(
    resultArray.map(async (e) => {
      e.ens = null;
      // e.ens = await provider.lookupAddress(e.addr);
      e.displayAddr = e.ens ? e.ens : e.addr.slice(0, 6) + "..." + e.addr.slice(-4);
      if (e.balance > 0) nbHolders += 1;
      totalSpentUSDCAmount += e.usdcAmounts.totalSpent;
      totalBidRefundUSDCAmount += e.usdcAmounts.bidRefundReceived;
      e.usdcAmounts = priceFormattedForAllValuesObject(6, e.usdcAmounts);
      return e;
    })
  );

  const lastBidderEns = lastBid.bidderAddr
    ? // ? await provider.lookupAddress(lastBid.bidderAddr)
      lastBid.bidderAddr
    : null;
  const lastBidderDisplayAddr = lastBidderEns
    ? lastBidderEns
    : lastBid.bidderAddr.slice(0, 6) + "..." + lastBid.bidderAddr.slice(-4);

  const lastUpdate = new Date().toJSON();

  const lastActivities = Object.values(protocolFees)
    .sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    .map((e) => {
      nbRevenueCalls += 1;
      totalProtocolRevenueUSDCAmount += e.usdcAmount;
      return { ...e, date: new Date(e.blockTimestamp * 1000) };
    });

  return new Response(
    JSON.stringify(
      {
        fetchDate,
        lastUpdate,
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
          lastBidderEns,
          date: new Date(lastBid.blockTimestamp * 1000)
        },
        lastActivities,
        rankings: resultArray
      },
      null,
      4
    ),
    {
      headers: {
        "content-type": "application/json"
      }
    }
  );
}

export const revalidate = 900; // 15 minutes
