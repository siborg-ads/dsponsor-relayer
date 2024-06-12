import { Alchemy } from "alchemy-sdk";
import { parseUnits } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfos, priceFormattedForAllValuesObject } from "@/utils";

export async function getAllOffers(chainId) {
  const geAllOffersQuery = /* GraphQL */ `
    query getAllOffers {
      adOffers {
        ...BaseAdOfferFragment
        nftContract {
          id
        }
      }
    }
  `;
  const graphResult = await executeQuery(chainId, geAllOffersQuery);
  return graphResult.data.adOffers;
}

export async function getHolders(chainId, nftContractAddresses) {
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

    for (const { ownerAddress, tokenBalances } of owners) {
      if (!ownerBalances[ownerAddress]) {
        ownerBalances[ownerAddress] = 0;
      }
      for (const { balance } of tokenBalances) {
        ownerBalances[ownerAddress] += Number(balance);
      }
    }
  }
  return ownerBalances;
}

export async function getSpendings(chainId, fromTimestamp = "0", toTimestamp = "99999999999") {
  const getBidsQuery = /* GraphQL */ `
    query getBids(
      $fromTimestamp: BigInt
      $toTimestamp: BigInt
      $firstBids: Int
      $skipBids: Int
      $firstListings: Int
      $skipListings: Int
    ) {
      marketplaceListings(
        first: $firstListings
        skip: $skipListings
        where: {
          listingType: Auction
          bids_: { creationTimestamp_gte: $fromTimestamp, creationTimestamp_lte: $toTimestamp }
        }
      ) {
        status
        currency
        token {
          tokenId
          mint {
            tokenData
          }
          nftContract {
            id
            adOffers {
              id
              metadataURL
              name
            }
          }
        }
        bids(first: $firstBids, skip: $skipBids, orderBy: creationTimestamp, orderDirection: desc) {
          ...MarketplaceBidFragment
          amountSentToCreator
          creatorRecipient
          amountSentToProtocol
          amountSentToSeller
          sellerRecipient
        }
      }
    }
  `;

  const result = {};
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

  let noMoreListings = false;
  let noMoreBids = false;
  const firstBids = 1000;
  let skipBids = 0;
  const firstListings = 1000;
  let skipListings = 0;

  while (!noMoreListings) {
    noMoreListings = true;
    while (!noMoreBids) {
      noMoreBids = true;
      const graphResult = await executeQuery(chainId, getBidsQuery, {
        fromTimestamp,
        toTimestamp,
        firstBids,
        skipBids,
        firstListings,
        skipListings
      });

      const { marketplaceListings } = graphResult.data;

      if (marketplaceListings.length) {
        noMoreListings = false;

        for (const { bids, ...listing } of marketplaceListings) {
          if (bids.length) {
            noMoreBids = false;

            for (const {
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
                lastBid.listing = listing;
              }

              setupResult(bidder, currency);
              result[bidder].nbBids += 1;

              if (refundProfit > BigInt("0")) {
                result[bidder]["currenciesAmounts"][currency].bidRefundReceived +=
                  BigInt(refundProfit);
                result[bidder]["currenciesAmounts"][currency].totalReceived += BigInt(refundProfit);
                result[bidder].nbRefunds += 1;

                const refundAmount = BigInt(paidBidAmount) + BigInt(refundProfit);
                result[bidder]["currenciesAmounts"][currency].bidSpent -= refundAmount;
                result[bidder]["currenciesAmounts"][currency].totalSpent += refundAmount;
              } else {
                result[bidder]["currenciesAmounts"][currency].bidSpent += BigInt(paidBidAmount);
                result[bidder]["currenciesAmounts"][currency].totalSpent += BigInt(paidBidAmount);
              }
            }
          }
        }
      }
      skipBids += firstBids;
    }
    skipListings += firstListings;
  }

  ////////////////////////////////

  /* @todo
revenueTransactions(
        where: { blockTimestamp_gte: $fromTimestamp, blockTimestamp_lte: $toTimestamp }
      ) {
        ...RevenueTransactionFragment
      }


  for (const {
    marketplaceBids,
    marketplaceDirectBuys,
    marketplaceOffers,
    mint,
    protocolFees
  } of graphResult.data.revenueTransactions) {
  }
    */

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

  return { totalBids, lastBid, spendings: result };
}
