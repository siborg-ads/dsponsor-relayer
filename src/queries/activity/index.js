import { Alchemy } from "alchemy-sdk";
import { parseUnits, getAddress } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfos, priceFormattedForAllValuesObject } from "@/utils";

export async function getAllOffers(fetchOptions, chainId) {
  let skip = 0;
  let offers = [];
  let hasMore = true;

  while (hasMore) {
    const geAllOffersQuery = /* GraphQL */ `
      query getAllOffers($skip: Int!) {
        adOffers(first: 1000, skip: $skip) {
          ...BaseAdOfferFragment
          nftContract {
            id
          }
        }
      }
    `;
    const graphResult = await executeQuery(chainId, geAllOffersQuery, { skip }, fetchOptions);

    if (graphResult.data.adOffers.length > 0) {
      hasMore = true;
      offers = [...offers, ...graphResult.data.adOffers];
    } else {
      hasMore = false;
    }

    skip += 1000;
  }

  return offers;
}

export async function getHolders(chainId, nftContractAddresses, userAddress) {
  const settings = {
    apiKey: process.env.NEXT_ALCHEMY_API_KEY,
    network: config[chainId].network
  };

  const alchemy = new Alchemy(settings);

  const ownerBalances = {};

  for (const nftContractAddress of nftContractAddresses) {
    const { owners } = await alchemy.nft.getOwnersForContract(nftContractAddress, {
      withTokenBalances: true
    });

    for (let { ownerAddress, tokenBalances } of owners) {
      ownerAddress = getAddress(ownerAddress);
      if (!ownerBalances[ownerAddress]) {
        ownerBalances[ownerAddress] = 0;
      }
      for (const { balance } of tokenBalances) {
        ownerBalances[ownerAddress] += Number(balance);
      }
    }
  }
  return userAddress
    ? { [getAddress(userAddress)]: ownerBalances[getAddress(userAddress)] }
    : ownerBalances;
}

export async function getSpendings(
  fetchOptions,
  chainId,
  nftContractAddress,
  userAddress,
  fromTimestamp,
  toTimestamp
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
                { referralAdditionalInformation_contains: $userAddress }
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

  let noMoreOffers = false;
  let noMoreTokens = false;

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
        },
        currenciesAmounts: {}
      };
    }

    if (!result[addr]["currenciesAmounts"][currency]) {
      result[addr]["currenciesAmounts"][currency] = {
        totalSpent: BigInt("0"),
        totalReceived: BigInt("0"),
        //
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
      };
    }
  };

  function processProtocolFee(protocolFeeObj, type) {
    let {
      id,
      blockTimestamp,
      transactionHash,
      currency,
      fee,
      enabler,
      spender,
      referralAddresses
    } = protocolFeeObj;

    let refAddr = referralAddresses.length
      ? referralAddresses[0]
      : "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf";

    enabler = getAddress(enabler);
    spender = getAddress(spender);
    refAddr = getAddress(refAddr);

    [enabler, spender, refAddr].forEach((addr) => {
      setupResult(addr, currency);
      result[addr]["currenciesAmounts"][currency].totalProtocolFee += BigInt(fee);
    });

    protocolFees[id] = {
      blockTimestamp,
      transactionHash,
      type,
      currency,
      fee,
      enabler,
      spender,
      refAddr,
      referralAddresses
    };
  }

  while (!noMoreOffers) {
    noMoreOffers = true;
    skipTokens = 0;

    while (!noMoreTokens) {
      noMoreTokens = true;
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
        fetchOptions
      );

      const { adOffers } = graphResult.data;

      if (adOffers.length) {
        noMoreOffers = false;

        for (const {
          id: offerId,
          nftContract: { id: contractAddress, tokens }
        } of adOffers) {
          if (tokens.length) {
            noMoreTokens = false;

            for (const { tokenId, mint, metadata, marketplaceListings } of tokens) {
              const { tokenData, revenueTransaction: revenueTransactionMint } = mint ? mint : {};

              if (
                revenueTransactionMint &&
                revenueTransactionMint.protocolFees &&
                revenueTransactionMint.protocolFees.length
              ) {
                for (const protocolFeeObj of revenueTransactionMint.protocolFees) {
                  processProtocolFee(protocolFeeObj, "mint");
                }
              }

              for (const { bids, directBuys, completedBid } of marketplaceListings) {
                for (const { revenueTransaction } of directBuys) {
                  if (revenueTransaction && revenueTransaction.protocolFees) {
                    for (const protocolFeeObj of revenueTransaction.protocolFees) {
                      processProtocolFee(protocolFeeObj, "buy");
                    }
                  }
                }

                if (
                  completedBid &&
                  completedBid.revenueTransaction &&
                  completedBid.revenueTransaction.protocolFees
                ) {
                  for (const protocolFeeObj of completedBid.revenueTransaction.protocolFees) {
                    processProtocolFee(protocolFeeObj, "auction");
                  }
                }

                if (bids.length) {
                  noMoreTokens = false;

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
                    setupResult(bidder, currency);
                    result[bidder].nbBids += 1;

                    if (refundProfit > BigInt("0")) {
                      result[bidder]["currenciesAmounts"][currency].bidRefundReceived +=
                        BigInt(refundProfit);
                      result[bidder]["currenciesAmounts"][currency].totalReceived +=
                        BigInt(refundProfit);
                      result[bidder].nbRefunds += 1;

                      result[bidder]["currenciesAmounts"][currency].bidSpent -=
                        BigInt(refundProfit);
                      result[bidder]["currenciesAmounts"][currency].totalSpent +=
                        BigInt(refundProfit);
                    } else {
                      result[bidder]["currenciesAmounts"][currency].bidSpent +=
                        BigInt(paidBidAmount);
                      result[bidder]["currenciesAmounts"][currency].totalSpent +=
                        BigInt(paidBidAmount);
                    }
                  }
                }
              }
            }
          }
        }
        skipTokens += firstTokens;
      }
    }

    skipOffers += firstOffers;
  }

  ////////////////////////////////

  for (const addr of Object.keys(result)) {
    for (const currency of Object.keys(result[addr]["currenciesAmounts"])) {
      const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);

      for (const key of Object.keys(result[addr]["currenciesAmounts"][currency])) {
        const usdcAmount =
          (BigInt(priceUSDC) * BigInt(result[addr]["currenciesAmounts"][currency][key])) /
          parseUnits("1", decimals);
        result[addr]["usdcAmounts"][key] += usdcAmount;
      }
      result[addr]["currenciesAmounts"][currency] = {
        symbol,
        ...priceFormattedForAllValuesObject(6, { priceUSDC }),
        ...priceFormattedForAllValuesObject(decimals, result[addr]["currenciesAmounts"][currency])
      };
    }
    // delete result[addr]["currenciesAmounts"];
  }

  for (const protocolFeeId of Object.keys(protocolFees)) {
    const { currency, fee } = protocolFees[protocolFeeId];
    const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);
    const usdcAmount = (BigInt(priceUSDC) * BigInt(fee)) / parseUnits("1", decimals);
    protocolFees[protocolFeeId] = {
      ...protocolFees[protocolFeeId],
      symbol,
      decimals,
      usdcAmount,
      formattedAmounts: {
        ...priceFormattedForAllValuesObject(decimals, { fee }),
        ...priceFormattedForAllValuesObject(6, { usdcAmount })
      }
    };
  }

  return { totalBids, lastBid, spendings: result, protocolFees };
}
