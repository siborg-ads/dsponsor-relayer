import { formatUnits, parseUnits, getAddress, isAddress } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfosAtBlocktimestamp } from "@/utils";

export async function getAllOffers(chainId, options) {
  let skip = 0;
  let offers = [];
  // let hasMore = true;

  // @dev : no pagination for now
  //  while (hasMore) {
  const getAllOffersQuery = /* GraphQL */ `
    query getAllOffers($skip: Int!) {
      adOffers(first: 1000, skip: $skip) {
        ...BaseAdOfferFragment
        nftContract {
          id
        }
      }
    }
  `;
  const baseOptions = { populate: false, next: { tags: [`${chainId}-adOffers`] } };
  options = options ? { ...baseOptions, ...options } : baseOptions;
  const graphResult = await executeQuery(chainId, getAllOffersQuery, { skip }, options);

  if (graphResult.data.adOffers.length > 0) {
    // hasMore = true;
    offers = [...offers, ...graphResult.data.adOffers];
  } else {
    // hasMore = false;
  }

  skip += 1000;
  // }

  return offers;
}

export async function getActivity(
  chainId,
  fromTimestamp,
  toTimestamp,
  userAddress,
  nftContractAddress,
  options
) {
  // const provider = new ethers.JsonRpcProvider(config[1].rpcURL); // ethereum RPC for ENS

  const { totalBids, totalUsdRevenueFees, lastBid, result, protocolFees } = await getSpendings(
    chainId,
    nftContractAddress,
    userAddress,
    fromTimestamp,
    toTimestamp,
    options
  );

  const smartContractsAddresses = Object.keys(config[chainId].smartContracts).map((k) =>
    getAddress(config[chainId].smartContracts[k].address)
  );

  let resultArray = Object.keys(result)
    .map((key) => result[key])
    .filter((e) => {
      const isSCAddr = smartContractsAddresses.includes(e.addr);
      const isExcludedRankAddress = [
        // "0x9a7FAC267228f536A8f250E65d7C4CA7d39De766",
        // "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf"
      ].includes(e.addr);
      const filterByUser = userAddress ? e.addr == userAddress : true;

      return !isSCAddr && !isExcludedRankAddress && filterByUser;
    });

  // let totalSpentUSDCAmount = BigInt("0");
  // let totalBidRefundUSDCAmount = BigInt("0");
  // let totalProtocolRevenueUSDCAmount = BigInt("0");
  let nbHolders = 0;
  let totalNbPoints = 0;

  resultArray = resultArray
    .sort((a, b) => b.balance - a.balance)
    .map((e, i) => {
      e.displayAddr = e.addr.slice(0, 6) + "..." + e.addr.slice(-4);
      if (e.balance > 0) nbHolders += 1;
      totalNbPoints += e.points;

      return { ...e, holdersRank: i + 1 };
    });

  resultArray = resultArray
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({
      ...e,
      pointsShare: e.points / totalNbPoints,
      points: Math.round(e.points),
      totalProtocolFeeRank: i + 1
    }));

  /*
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
    */

  /*
  resultArray = await Promise.all(
    resultArray.map(async (e) => {
      // e.ens = await provider.lookupAddress(e.addr);           
      totalSpentUSDCAmount += e.usdcAmounts.totalSpent;
       totalBidRefundUSDCAmount += e.usdcAmounts.bidRefundReceived;
      const negativeToZero = true;
      const prettyFormatted = false;
      e.usdcAmounts = priceFormattedForAllValuesObject(
        6,
        e.usdcAmounts,
        negativeToZero,
        prettyFormatted
      );
      
      return e;
    })
  );
  */

  lastBid.bidderAddr = lastBid.bidderAddr ? getAddress(lastBid.bidderAddr) : null;
  const lastBidderEns = lastBid.bidderAddr
    ? // ? await provider.lookupAddress(lastBid.bidderAddr)
      lastBid.bidderAddr
    : null;
  const lastBidderDisplayAddr = lastBidderEns
    ? lastBidderEns
    : lastBid.bidderAddr.slice(0, 6) + "..." + lastBid.bidderAddr.slice(-4);

  const lastActivities = Object.values(protocolFees).sort(
    (a, b) => b.blockTimestamp - a.blockTimestamp
  );
  const nbRevenueCalls = lastActivities.length;

  return {
    totalBids,
    /*
    ...priceFormattedForAllValuesObject(6, {
      totalProtocolRevenueUSDCAmount,
      totalSpentUSDCAmount,
      totalBidRefundUSDCAmount
    }),
    */
    nbHolders,
    nbRevenueCalls,
    totalUsdRevenueFees,
    totalNbPoints,
    lastBid: {
      ...lastBid,
      lastBidderDisplayAddr,
      date: new Date(lastBid.blockTimestamp * 1000)
    },
    lastActivities,
    rankings: resultArray
  };
}

export async function getSpendings(
  chainId,
  nftContractAddress,
  userAddress,
  fromTimestamp,
  toTimestamp,
  options
) {
  nftContractAddress = nftContractAddress ? nftContractAddress.toLowerCase() : "";

  if (!userAddress) userAddress = "";
  if (!fromTimestamp) fromTimestamp = "0";
  if (!toTimestamp) toTimestamp = "99999999999";

  const getSpendingsQuery = /* GraphQL */ `
    fragment RevenueTransactionFragmentFiltering on RevenueTransaction {
      protocolFees(
        where: {
          and: [
            { blockTimestamp_gte: $fromTimestamp }
            { blockTimestamp_lte: $toTimestamp }
            {
              or: [
                { enabler_contains: $userAddress }
                { spender_contains: $userAddress }
                { referralAddresses_contains: [$userAddress] }
              ]
            }
          ]
        }
      ) {
        ...BaseProtocolFeesFragment
      }
    }
    query getSpendings(
      $nftContractAddress: Bytes!
      $userAddress: Bytes!
      $fromTimestamp: BigInt!
      $toTimestamp: BigInt!
      $firstOffers: Int!
      $skipOffers: Int!
      $firstTokens: Int!
      $skipTokens: Int!
    ) {
      adOffers(
        first: $firstOffers
        skip: $skipOffers
        where: { nftContract_: { id_contains: $nftContractAddress } }
      ) {
        id
        metadataURL
        name
        nftContract {
          id
          tokens(first: $firstTokens, skip: $skipTokens) {
            tokenId
            owner
            mint {
              tokenData
              revenueTransaction {
                ...RevenueTransactionFragmentFiltering
              }
            }
            marketplaceListings(first: 1000, orderBy: creationTimestamp, orderDirection: desc) {
              status
              currency
              directBuys {
                revenueTransaction {
                  ...RevenueTransactionFragmentFiltering
                }
              }
              completedBid {
                revenueTransaction {
                  ...RevenueTransactionFragmentFiltering
                }
              }
              bids(
                first: 1000
                orderBy: creationTimestamp
                orderDirection: desc
                where: {
                  bidder_contains: $userAddress
                  creationTimestamp_gte: $fromTimestamp
                  creationTimestamp_lte: $toTimestamp
                }
              ) {
                ...MarketplaceBidFragment
              }
            }
          }
        }
      }
    }
  `;

  // let noMoreOffers = false;
  // let noMoreTokens = false;

  const firstOffers = 1000;
  let skipOffers = 0;
  const firstTokens = 1000;
  let skipTokens = 0;

  const result = {};
  const protocolFees = {};
  const lastBid = {
    blockTimestamp: 0,
    bidderAddr: "0x0000000000000000000000000000000000000000",
    listingId: "0"
  };
  let totalBids = 0;

  const setupResult = (addr, currency) => {
    if (!result[addr]) {
      result[addr] = {
        addr,
        balance: 0,
        nbBids: 0,
        nbRefunds: 0,
        nbProtocolFeeBuys: 0,
        nbProtocolFeeSells: 0,
        nbProtocolFeeReferrals: 0,
        points: 0,
        /*
        usdcAmounts: {
          // total USDC
          totalSpent: BigInt("0"),
          totalReceived: BigInt("0"),
          bidSpent: BigInt("0"),
          bidRefundReceived: BigInt("0"),
          totalProtocolFee: BigInt("0")
        },
        */
        currenciesAmounts: {}
      };
    }

    if (currency && !result[addr]["currenciesAmounts"][currency]) {
      result[addr]["currenciesAmounts"][currency] = {
        totalSpent: BigInt("0"),
        totalReceived: BigInt("0"),
        bidSpent: BigInt("0"),
        bidRefundReceived: BigInt("0"),
        totalProtocolFee: BigInt("0")
      };
    }
  };

  async function processProtocolFee(protocolFeeObj, type) {
    let {
      offerId,
      offerName,
      tokenId,
      tokenData,
      id,
      blockTimestamp,
      transactionHash,
      currency,
      fee,
      enabler,
      spender,
      referralAddresses
    } = protocolFeeObj;

    if (!protocolFees[id]) {
      let refAddr =
        referralAddresses.length && isAddress(referralAddresses[0]) ? referralAddresses[0] : "";

      enabler = getAddress(enabler);
      spender = getAddress(spender);
      refAddr = isAddress(refAddr) ? getAddress(refAddr) : "";
      currency = getAddress(currency);

      const { priceUSDC, decimals } = await getCurrencyInfosAtBlocktimestamp(
        chainId,
        currency,
        blockTimestamp
      );
      const usdcAmount = (BigInt(priceUSDC) * BigInt(fee)) / parseUnits("1", decimals);
      const points = parseFloat(formatUnits(usdcAmount, 6));

      for (const addr of [enabler, spender, refAddr]) {
        if (isAddress(addr)) {
          setupResult(addr, currency);
          result[addr]["currenciesAmounts"][currency].totalProtocolFee += BigInt(fee);
          result[addr]["points"] += points;
        }
      }

      if (points > 0) {
        result[enabler].nbProtocolFeeSells += 1;
        result[spender].nbProtocolFeeBuys += 1;
        if (isAddress(refAddr)) result[refAddr].nbProtocolFeeReferrals += 1;
      }

      protocolFees[id] = {
        blockTimestamp,
        transactionHash,
        type,
        currency,
        fee,
        enabler,
        spender,
        refAddr,
        referralAddresses,
        offerId,
        offerName,
        tokenId,
        tokenData
      };
    }
  }

  // @we disable the while loop for now - no need for pagination right now
  // while (!noMoreOffers) {
  // noMoreOffers = true;
  // noMoreTokens = false;
  skipTokens = 0;

  // while (!noMoreTokens) {
  // noMoreTokens = true;

  const tags = [];
  if (nftContractAddress?.length) {
    tags.push(`${chainId}-nftContract-${getAddress(nftContractAddress)}`);
  }
  if (userAddress?.length) {
    tags.push(`${chainId}-userAddress-${getAddress(userAddress)}`);
  }
  if (tags.length === 0) {
    tags.push(`${chainId}-activity`);
  }
  const baseOptions = { populate: false, next: { tags } };
  options = options ? { ...baseOptions, ...options } : baseOptions;
  const graphResult = await executeQuery(
    chainId,
    getSpendingsQuery,
    {
      nftContractAddress,
      userAddress,
      fromTimestamp,
      toTimestamp,
      firstOffers,
      skipOffers,
      firstTokens,
      skipTokens
    },
    options
  );
  const { adOffers } = graphResult.data;

  if (adOffers.length) {
    // noMoreOffers = false;

    for (const {
      id: offerId,
      name: offerName,
      nftContract: { id: contractAddress, tokens }
    } of adOffers) {
      if (tokens.length) {
        // noMoreTokens = false;

        for (const { tokenId, owner, mint, metadata, marketplaceListings } of tokens) {
          const { tokenData, revenueTransaction: revenueTransactionMint } = mint ? mint : {};

          if (owner && (!isAddress(userAddress) || getAddress(owner) === getAddress(userAddress))) {
            const addr = getAddress(owner);
            setupResult(addr);
            result[addr].balance += 1;
          }

          if (
            revenueTransactionMint &&
            revenueTransactionMint.protocolFees &&
            revenueTransactionMint.protocolFees.length
          ) {
            for (const protocolFeeObj of revenueTransactionMint.protocolFees) {
              await processProtocolFee(
                {
                  offerId,
                  offerName,
                  tokenId,
                  tokenData,
                  ...protocolFeeObj
                },
                "mint"
              );
            }
          }

          for (const { bids, directBuys, completedBid } of marketplaceListings) {
            for (const { revenueTransaction } of directBuys) {
              if (revenueTransaction && revenueTransaction.protocolFees) {
                for (const protocolFeeObj of revenueTransaction.protocolFees) {
                  await processProtocolFee(
                    {
                      offerId,
                      offerName,
                      tokenId,
                      tokenData,
                      ...protocolFeeObj
                    },
                    "buy"
                  );
                }
              }
            }

            if (
              completedBid &&
              completedBid.revenueTransaction &&
              completedBid.revenueTransaction.protocolFees
            ) {
              for (const protocolFeeObj of completedBid.revenueTransaction.protocolFees) {
                await processProtocolFee(
                  {
                    offerId,
                    offerName,
                    tokenId,
                    tokenData,
                    ...protocolFeeObj
                  },
                  "auction"
                );
              }
            }

            if (bids.length) {
              // noMoreTokens = false;

              for (let {
                creationTimestamp,
                bidder,
                paidBidAmount,
                refundProfit,
                currency
              } of bids) {
                totalBids += 1;

                if (creationTimestamp > lastBid.blockTimestamp) {
                  lastBid.blockTimestamp = creationTimestamp;
                  lastBid.bidderAddr = bidder;
                  lastBid.listing = { tokenId, contractAddress, offerId, tokenData, metadata };
                }

                bidder = getAddress(bidder);
                currency = getAddress(currency);
                setupResult(bidder, currency);
                result[bidder].nbBids += 1;

                if (refundProfit > BigInt("0")) {
                  result[bidder]["currenciesAmounts"][currency].bidRefundReceived +=
                    BigInt(refundProfit);
                  result[bidder]["currenciesAmounts"][currency].totalReceived +=
                    BigInt(refundProfit);
                  result[bidder].nbRefunds += 1;

                  result[bidder]["currenciesAmounts"][currency].bidSpent -= BigInt(refundProfit);
                  result[bidder]["currenciesAmounts"][currency].totalSpent -= BigInt(refundProfit);
                } else {
                  result[bidder]["currenciesAmounts"][currency].bidSpent += BigInt(paidBidAmount);
                  result[bidder]["currenciesAmounts"][currency].totalSpent += BigInt(paidBidAmount);
                }

                //
              }
            }
          }
        }
      }
    }
    skipTokens += firstTokens;
  }
  // }
  skipOffers += firstOffers;
  //  }

  ////////////////////////////////

  /*
  for (const addr of Object.keys(result)) {
    for (const currency of Object.keys(result[addr]["currenciesAmounts"])) {
      const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);
      for (const key of Object.keys(result[addr]["currenciesAmounts"][currency])) {
        const usdcAmount =
          (BigInt(priceUSDC) * BigInt(result[addr]["currenciesAmounts"][currency][key])) /
          parseUnits("1", decimals);
        result[addr]["usdcAmounts"][key] += usdcAmount;
      }

      result[addr]["currenciesAmounts"][currency].formatted = {
        symbol,
        ...priceFormattedForAllValuesObject(6, { priceUSDC }),
        ...priceFormattedForAllValuesObject(decimals, result[addr]["currenciesAmounts"][currency])
      };
    }
    // delete result[addr]["currenciesAmounts"];
  }
  */

  let totalUsdRevenueFees = 0;
  for (const protocolFeeId of Object.keys(protocolFees)) {
    const { currency, fee, blockTimestamp } = protocolFees[protocolFeeId];
    const { symbol, decimals, priceUSDC } = await getCurrencyInfosAtBlocktimestamp(
      chainId,
      currency,
      blockTimestamp
    );

    const usdcAmount = (BigInt(priceUSDC) * BigInt(fee)) / parseUnits("1", decimals);
    const points = parseFloat(formatUnits(usdcAmount, 6));
    totalUsdRevenueFees += points;
    protocolFees[protocolFeeId] = {
      date: new Date(blockTimestamp * 1000),
      ...protocolFees[protocolFeeId],
      symbol,
      decimals,
      points,
      usdcAmount
    };
  }

  return { totalBids, totalUsdRevenueFees, lastBid, result, protocolFees };
}
